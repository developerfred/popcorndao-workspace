pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../Staking.sol";
import "../Pool.sol";

contract DefendedHelper {
  using SafeERC20 for IERC20;

  IERC20 public token;
  Staking public staking;
  Pool public pool;

  constructor(
    IERC20 _token,
    Staking _staking,
    Pool _pool
  ) {
    token = _token;
    staking = _staking;
    pool = _pool;
  }

  function deposit(uint256 amount) public {
    token.approve(address(pool), amount);
    pool.deposit(amount);
  }

  function stake(uint256 amount) public {
    token.approve(address(staking), amount);
    staking.stake(amount, 604800);
  }
}
