// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

contract MockCurveAddressProvider {
  address registry;

  constructor(address registry_) {
    registry = registry_;
  }

  function get_registry() external view returns (address) {
    return registry;
  }
}
