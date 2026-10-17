/**
 * Shared helpers for deleting single admin-managed records.
 *
 * Only the three tables below can ever be deleted through this helper, and only by
 * their primary key (`id`, BIGSERIAL). Every query is `.eq('id', <one id>)`, so at most
 * one row can match. Nothing else references these tables (verified in data/*.sql),
 * so no dependent rows are affected.
 */

const ADMIN_RECORD_TABLES = {
  registrations: 'event_registrations',
  memberships: 'membership_applications',
  contact: 'contact_submissions',
};

/** Accepts only a positive integer string that fits a BIGINT primary key. */
export function parseRecordId(raw) {
  if (typeof raw !== 'string') return null;
  return /^[1-9][0-9]{0,17}$/.test(raw) ? raw : null;
}

/**
 * Deletes exactly one record. Returns { status, body } for the API handler.
 * The caller must already have verified the admin session.
 */
export async function deleteRecordById(client, recordType, rawId) {
  const table = Object.prototype.hasOwnProperty.call(ADMIN_RECORD_TABLES, recordType)
    ? ADMIN_RECORD_TABLES[recordType]
    : null;
  if (!table) {
    return { status: 400, body: { error: 'Invalid record type' } };
  }

  const id = parseRecordId(rawId);
  if (!id) {
    return { status: 400, body: { error: 'Invalid record id' } };
  }

  try {
    const { data, error } = await client.from(table).delete().eq('id', id).select('id');

    if (error) {
      console.error('Admin delete error:', { table, code: error.code });
      return { status: 500, body: { error: 'Failed to delete record' } };
    }

    const deleted = Array.isArray(data) ? data.length : 0;
    if (deleted === 0) {
      return { status: 404, body: { error: 'Record not found' } };
    }
    if (deleted > 1) {
      // Cannot happen with a primary-key match; never report success for an unexpected result
      console.error('Admin delete affected unexpected row count:', { table, deleted });
      return { status: 500, body: { error: 'Failed to delete record' } };
    }

    return { status: 200, body: { success: true, id } };
  } catch (err) {
    console.error('Admin delete exception:', { table, message: err && err.message });
    return { status: 500, body: { error: 'Failed to delete record' } };
  }
}
