import test from 'node:test';
import assert from 'node:assert/strict';
import Grievance from '../src/modules/grievances/grievance.model.js';
import GrievanceHistory from '../src/modules/grievance-history/grievance-history.model.js';
import ActionTakenReport from '../src/modules/action-taken-reports/action-taken-report.model.js';

test('grievance history records status and assignedBy without legacy note or actor fields', () => {
  for (const field of ['note', 'actor', 'actorName', 'isInternal']) {
    assert.equal(GrievanceHistory.schema.path(field), undefined);
  }
  assert.ok(GrievanceHistory.schema.path('assignedBy'));
});

test('action-taken reports require a departmentId reference', async () => {
  const report = new ActionTakenReport({
    grievance: new Grievance()._id,
    details: 'Investigation completed and action was taken.',
    submittedBy: new Grievance()._id
  });

  await assert.rejects(report.validate(), (error) => {
    assert.equal(error.name, 'ValidationError');
    assert.ok(error.errors.departmentId);
    return true;
  });
  assert.equal(ActionTakenReport.schema.path('departmentId').options.ref, 'Department');
});

test('grievances no longer embed extracted module data', () => {
  for (const field of ['history', 'attachments', 'actionReports', 'department', 'assignedOfficer']) {
    assert.equal(Grievance.schema.path(field), undefined);
  }
});
