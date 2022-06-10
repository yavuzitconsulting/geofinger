import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | web3service', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:web3service');
    assert.ok(service);
  });
});
