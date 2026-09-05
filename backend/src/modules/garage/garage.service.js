import supabase from '../../config/supabase.js';

class GarageService {
  /**
   * Add vehicle to garage (writes to normalized garage_vehicles table and users.vehicleId)
   */
  async addVehicleToGarage(userId, vehicleData) {
    if (!userId || !vehicleData) {
      throw new Error('User ID and vehicle data are required');
    }

    const make = (vehicleData.make || vehicleData.manuName || vehicleData.mfrName || 'Unknown').toUpperCase();
    const model = (vehicleData.model || vehicleData.modelName || vehicleData.vehicleModelSeriesName || 'Unknown').toUpperCase();
    const year = vehicleData.year || vehicleData.yearOfConstrFrom || null;
    const engineCode = vehicleData.engine || vehicleData.engineCode || vehicleData.engineNumber || null;
    const licensePlate = (vehicleData.licensePlate || vehicleData.license_plate || '').toUpperCase() || null;
    const vin = (vehicleData.vin || '').toUpperCase() || null;
    const linkageTargetId = vehicleData.carId || vehicleData.modalId || vehicleData.linkageTargetId || null;

    const rawSpecs = {
      ...(typeof vehicleData === 'object' ? vehicleData : {}),
      make,
      model,
      year,
      engine: engineCode,
      engine_code: engineCode,
      licensePlate,
      license_plate: licensePlate,
      vin,
    };

    // Insert into normalized garage_vehicles table
    const { data: garageEntry, error: insertError } = await supabase
      .from('garage_vehicles')
      .insert({
        user_id: userId,
        make,
        model,
        year: year ? String(year) : null,
        engine_code: engineCode,
        vin,
        linkage_target_id: linkageTargetId ? String(linkageTargetId) : null,
        raw_specs: rawSpecs,
      })
      .select();

    if (insertError) {
      console.warn('Could not insert into garage_vehicles table:', insertError.message);
      throw new Error(insertError.message);
    }

    return garageEntry || [rawSpecs];
  }

  /**
   * Get user's garage vehicles
   */
  async getGarageVehicles(userId) {
    const { data: vehicles, error } = await supabase
      .from('garage_vehicles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !vehicles) {
      return [];
    }

    const hasExplicitPrimary = vehicles.some(
      (v) => v.raw_specs?.isPrimary === true || v.raw_specs?.is_primary === true
    );

    // Normalize keys
    return vehicles.map((v, index) => {
      const isPrimary = hasExplicitPrimary
        ? Boolean(v.raw_specs?.isPrimary || v.raw_specs?.is_primary)
        : index === 0;

      return {
        id: v.id,
        make: v.make,
        model: v.model,
        year: v.year || v.raw_specs?.year,
        engine: v.engine_code || v.raw_specs?.engine || v.raw_specs?.engine_code || 'Standard',
        engine_code: v.engine_code || v.raw_specs?.engine || v.raw_specs?.engine_code || 'Standard',
        licensePlate: v.raw_specs?.licensePlate || v.raw_specs?.license_plate || '',
        license_plate: v.raw_specs?.licensePlate || v.raw_specs?.license_plate || '',
        vin: v.vin || v.raw_specs?.vin || '',
        linkageTargetId: v.linkage_target_id,
        raw_specs: v.raw_specs || {},
        isPrimary,
        is_primary: isPrimary,
        created_at: v.created_at,
      };
    });
  }

  /**
   * Update vehicle in garage
   */
  async updateVehicleInGarage(userId, vehicleId, updates = {}) {
    if (!userId || !vehicleId) {
      throw new Error('User ID and Vehicle ID are required');
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(vehicleId));
    let query = supabase
      .from('garage_vehicles')
      .select('*')
      .eq('user_id', userId);

    if (isUuid) {
      query = query.eq('id', vehicleId);
    } else {
      query = query.or(`id.eq.${vehicleId},linkage_target_id.eq.${vehicleId}`);
    }

    const { data: currentVehicle, error: findError } = await query.maybeSingle();

    if (findError) {
      console.warn('Error finding vehicle for update:', findError.message);
    }

    const targetId = currentVehicle?.id || (isUuid ? vehicleId : null);
    if (!targetId) {
      throw new Error(`Vehicle ${vehicleId} not found in garage`);
    }

    const existingSpecs = currentVehicle?.raw_specs || {};
    const updatedSpecs = {
      ...existingSpecs,
      ...(updates.raw_specs || {}),
      licensePlate: updates.licensePlate !== undefined ? updates.licensePlate : (existingSpecs.licensePlate || existingSpecs.license_plate || ''),
      license_plate: updates.licensePlate !== undefined ? updates.licensePlate : (existingSpecs.licensePlate || existingSpecs.license_plate || ''),
      vin: updates.vin !== undefined ? updates.vin : (existingSpecs.vin || currentVehicle?.vin || ''),
      engine: updates.engine !== undefined ? updates.engine : (existingSpecs.engine || currentVehicle?.engine_code || ''),
      engine_code: updates.engine !== undefined ? updates.engine : (existingSpecs.engine_code || currentVehicle?.engine_code || ''),
      year: updates.year !== undefined ? updates.year : (existingSpecs.year || currentVehicle?.year || ''),
      nickname: updates.nickname !== undefined ? updates.nickname : existingSpecs.nickname,
      isPrimary: updates.isPrimary !== undefined ? Boolean(updates.isPrimary) : Boolean(existingSpecs.isPrimary),
      is_primary: updates.isPrimary !== undefined ? Boolean(updates.isPrimary) : Boolean(existingSpecs.is_primary),
    };

    // Only update valid columns that exist in the Supabase garage_vehicles table
    const updatePayload = {
      raw_specs: updatedSpecs,
    };
    if (updates.vin !== undefined) {
      updatePayload.vin = updates.vin ? String(updates.vin).trim() : null;
    }
    if (updates.engine !== undefined) {
      updatePayload.engine_code = updates.engine ? String(updates.engine).trim() : null;
    }
    if (updates.year !== undefined) {
      updatePayload.year = updates.year ? String(updates.year).trim() : null;
    }

    const { data: updatedEntry, error: updateErr } = await supabase
      .from('garage_vehicles')
      .update(updatePayload)
      .eq('id', targetId)
      .select();

    if (updateErr) {
      console.error('Could not update garage_vehicles:', updateErr.message);
      throw new Error(`Failed to update vehicle in database: ${updateErr.message}`);
    }

    // If isPrimary was set to true, update all other vehicles for this user to be false
    if (updates.isPrimary) {
      await this.setPrimaryVehicle(userId, targetId);
    }

    return updatedEntry || [updatedSpecs];
  }

  /**
   * Set vehicle as primary
   */
  async setPrimaryVehicle(userId, vehicleId) {
    if (!userId || !vehicleId) return;

    // Fetch user's vehicles
    const { data: vehicles, error } = await supabase
      .from('garage_vehicles')
      .select('*')
      .eq('user_id', userId);

    if (error || !vehicles) return;

    for (const v of vehicles) {
      const isTarget = String(v.id) === String(vehicleId);
      const updatedSpecs = {
        ...(v.raw_specs || {}),
        isPrimary: isTarget,
        is_primary: isTarget,
      };
      await supabase
        .from('garage_vehicles')
        .update({ raw_specs: updatedSpecs })
        .eq('id', v.id);
    }
    return { id: vehicleId, isPrimary: true };
  }

  /**
   * Remove vehicle from garage
   */
  async removeVehicleFromGarage(userId, vehicleId) {
    if (!userId || !vehicleId) return;

    // Delete from garage_vehicles table
    await supabase
      .from('garage_vehicles')
      .delete()
      .eq('user_id', userId)
      .eq('id', vehicleId);
  }

  /**
   * Add to search history
   */
  async addSearchHistory(userId, searchData) {
    return [{ success: true }];
  }

  /**
   * Add to Watchlist (Normalized watchlist_items table)
   */
  async addToWatchlist(userId, item) {
    const articleId = String(item.articleId || item.id || item.partNumber || item.model || Date.now());
    const partNumber = item.partNumber || item.articleNumber || item.subtitle || item.model || '';
    const brandName = item.brandName || item.mfrName || item.make || 'NGK';

    // Insert into normalized watchlist_items
    const { data, error } = await supabase.from('watchlist_items').upsert(
      {
        user_id: userId,
        article_id: articleId,
        part_number: partNumber,
        brand_name: brandName,
        article_summary: item,
      },
      { onConflict: 'user_id,article_id' }
    ).select();

    if (error) {
      console.warn('Could not upsert into watchlist_items:', error.message);
    }

    return data || [{ watchList: [item] }];
  }

  /**
   * Remove from Watchlist
   */
  async removeFromWatchlist(userId, partId) {
    await supabase
      .from('watchlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', String(partId));

    return [{ success: true }];
  }
}

export const garageService = new GarageService();
export default garageService;
