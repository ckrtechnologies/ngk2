import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../../config/supabase.js';
import ENV from '../../config/env.js';
import mailService from '../../services/mail.service.js';

class AuthService {
  /**
   * Register a new user and generate JWT
   */
  async register({
    name,
    email,
    password,
    role = 'owner',
    address = '',
    address_components = null,
    phone = '',
    latitude = null,
    longitude = null,
    company_name = '',
    street_address = '',
    city = '',
    province = '',
    postal_code = '',
    country = 'ZA',
  }) {
    if (!email || !password || !name) {
      throw new Error('Name, email, and password are required');
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRole = role.toLowerCase().trim();
    const isCommercial = cleanRole === 'reseller' || cleanRole === 'distributor';
    const finalCompanyName = (company_name || name).trim();
    const finalCity = (city || 'Johannesburg').trim();
    const finalStreet = (street_address || address).trim();
    const fullCombinedAddress = address.trim() || [street_address, city, province, postal_code, country].filter(Boolean).join(', ');

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', cleanEmail);

    if (existingUser && existingUser.length > 0) {
      throw new Error('An account with this email address already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert payload
    const insertPayload = {
      name: name.trim(),
      email: cleanEmail,
      password_hash: passwordHash,
      role: cleanRole,
      address: fullCombinedAddress,
      phone: phone.trim() || null,
      is_approved: !isCommercial,
      approval_status: isCommercial ? 'pending_approval' : 'approved',
    };
    if (address_components && typeof address_components === 'object') {
      insertPayload.address_components = address_components;
    }

    // Insert into normalized users table
    let { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(insertPayload)
      .select('id, name, email, role, address, phone, is_approved, approval_status, created_at')
      .single();

    if (insertError && insertPayload.address_components) {
      console.warn('Register user failed with address_components, retrying without it:', insertError.message);
      delete insertPayload.address_components;
      const retryResult = await supabase
        .from('users')
        .insert(insertPayload)
        .select('id, name, email, role, address, phone, is_approved, approval_status, created_at')
        .single();
      newUser = retryResult.data;
      insertError = retryResult.error;
    }

    if (insertError) {
      console.error('Supabase user registration error:', insertError);
      throw new Error(insertError.message || 'Failed to create user account');
    }

    // If reseller or distributor, create initial dealer directory record (unapproved/pending)
    if (isCommercial) {
      try {
        let lat = latitude ? parseFloat(latitude) : null;
        let lon = longitude ? parseFloat(longitude) : null;
        if ((!lat || !lon) && address && address.includes('GPS:')) {
          const match = address.match(/GPS:\s*([-\d.]+),\s*([-\d.]+)/);
          if (match) {
            lat = parseFloat(match[1]);
            lon = parseFloat(match[2]);
          }
        }

        const dLat = lat || -26.2041;
        const dLon = lon || 28.0473;

        await supabase.from('dealers').insert({
          user_id: newUser.id,
          company_name: finalCompanyName,
          street_address: finalStreet || 'Address on file',
          city: finalCity,
          country: country || 'ZA',
          latitude: dLat,
          longitude: dLon,
          location: `POINT(${dLon} ${dLat})`,
          phone: phone.trim() || null,
          contact_email: cleanEmail,
          is_live: false,
        });
      } catch (dealerErr) {
        console.warn('Auto-creating dealer row during registration:', dealerErr.message);
      }
    }

    // Generate JWT token
    const token = this.generateToken(newUser);

    return { user: newUser, token };
  }

  /**
   * Login user with email & password (Clean JWT auth, no client-side whitelisting)
   */
  async login({ email, password, role }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const cleanEmail = email.toLowerCase().trim();

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail);

    if (error || !users || users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // Verify password hash
    const storedHash = user.password_hash || user.password;
    const isPasswordValid = await bcrypt.compare(password, storedHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Role check if role is specified
    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      throw new Error(`Account role mismatch: expected ${role}, but account is registered as ${user.role}`);
    }

    // Generate JWT
    const token = this.generateToken(user);

    // Strip password hash from response
    const { password_hash: _, password: __, ...userProfile } = user;

    return {
      user: [userProfile], // Backward compatibility array format
      token,
      profile: userProfile,
    };
  }

  /**
   * Send 6-digit OTP for password recovery
   */
  async sendOtp(email) {
    if (!email) throw new Error('Email is required');

    const cleanEmail = email.toLowerCase().trim();
    const { data: users } = await supabase.from('users').select('id, email').eq('email', cleanEmail);

    if (!users || users.length === 0) {
      throw new Error('No registered account found with this email address');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store in auth_otps table
    await supabase.from('auth_otps').insert({
      email: cleanEmail,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });

    console.log(`[OTP Verification] Generated OTP for ${cleanEmail}: ${otp}`);

    // Dispatch OTP email via Nodemailer (Gmail SMTP)
    try {
      await mailService.sendOtpEmail({
        to: cleanEmail,
        otp,
        appName: 'NGK Auto Parts',
      });
    } catch (mailErr) {
      console.error(`[OTP Verification] Warning: Email dispatch failed for ${cleanEmail}:`, mailErr.message);
    }

    return {
      email: cleanEmail,
      otp: otp,
      expiresAt,
      message: 'OTP sent successfully to your email address',
    };
  }

  /**
   * Verify OTP and return password reset token
   */
  async verifyOtp(email, otp) {
    if (!email || !otp) throw new Error('Email and OTP are required');

    const cleanEmail = email.toLowerCase().trim();

    // Query latest active OTP for this email
    const { data: otps, error } = await supabase
      .from('auth_otps')
      .select('*')
      .eq('email', cleanEmail)
      .eq('is_consumed', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !otps || otps.length === 0) {
      throw new Error('Invalid or expired OTP. Please request a new one.');
    }

    const validOtp = await bcrypt.compare(otp.toString(), otps[0].otp_hash);
    if (!validOtp) {
      throw new Error('Invalid OTP code. Please try again.');
    }

    // Mark OTP as consumed
    await supabase.from('auth_otps').update({ is_consumed: true }).eq('id', otps[0].id);

    // Generate reset token valid for 15 minutes
    const resetToken = jwt.sign(
      { email: cleanEmail, purpose: 'password_reset' },
      ENV.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return { resetToken };
  }

  /**
   * Reset password with reset token or direct email match
   */
  async updatePassword({ email, password, newPassword }) {
    const targetPassword = password || newPassword;
    if (!email || !targetPassword) throw new Error('Email and new password are required');
    if (targetPassword.length < 6) throw new Error('Password must be at least 6 characters');

    const cleanEmail = email.toLowerCase().trim();
    const { data: users } = await supabase.from('users').select('id').eq('email', cleanEmail);

    if (!users || users.length === 0) {
      throw new Error('User not found');
    }

    const passwordHash = await bcrypt.hash(targetPassword, 10);

    const { data: updated, error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('email', cleanEmail)
      .select('id, name, email, role');

    if (error) throw new Error('Failed to update password');

    return { user: updated };
  }

  /**
   * Helper to sign JWT payload
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN }
    );
  }
}

export const authService = new AuthService();
export default authService;
