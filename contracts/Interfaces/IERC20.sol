pragma solidity 0.5.12;

interface IERC20 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function mint(address to, uint256 amount) external;

    function approve(address spender, uint256 amount)
        external
        returns (bool success);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256 remaining);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);
}
