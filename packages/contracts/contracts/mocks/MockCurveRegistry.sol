// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

contract MockCurveRegistry {
  address poolAddress;

  constructor(address poolAddress_) {
    poolAddress = poolAddress_;
  }

  function get_pool_from_lp_token(address lp_token)
    external
    view
    returns (address)
  {
    return poolAddress;
  }
}
