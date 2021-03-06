pragma solidity 0.5.12;

interface IVAULT {
    function mint(uint256 _collateralAmount) external;
    function refund(uint256 _tokenAmount) external;
    function primaryToken() external returns (address);
    function complementToken() external returns (address);
}
