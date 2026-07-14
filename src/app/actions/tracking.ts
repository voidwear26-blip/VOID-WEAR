
'use server';

/**
 * VOID WEAR // COURIER TRACKING RELAY
 * Interface with Delhivery API to fetch real-time package transitions.
 * Uses secure token authentication to protect the system waybill.
 */

export async function getDelhiveryTracking(trackingId: string) {
  const apiKey = process.env.DELHIVERY_API_KEY;
  if (!apiKey || !trackingId) {
    return { success: false, message: 'TRACKING_NODE_OFFLINE' };
  }

  try {
    const response = await fetch(`https://track.delhivery.com/api/v1/packages/json/?waybill=${trackingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('COURIER_UPLINK_FAILURE');

    const data = await response.json();
    
    /**
     * NARRATIVE EXTRACTION:
     * Extracting the current status and latest scan location.
     */
    const packageInfo = data.ShipmentData?.[0]?.Shipment;
    if (!packageInfo) return { success: false, message: 'WAYBILL_NOT_FOUND' };

    return {
      success: true,
      status: packageInfo.Status?.Status || 'IN_TRANSIT',
      location: packageInfo.Scans?.[0]?.ScanDetail?.ScannedLocation || 'PROCESSING CENTER',
      updatedAt: packageInfo.Status?.StatusDateTime || new Date().toISOString(),
      expectedDate: packageInfo.ExpectedDeliveryDate || null,
      raw: packageInfo
    };
  } catch (error) {
    console.error('[TRACKING_ERROR]', error);
    return { success: false, message: 'SYSTEM_SYNC_ERROR' };
  }
}
