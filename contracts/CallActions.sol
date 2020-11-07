pragma solidity >=0.4.22 <0.8.0;

// To Do : rename IIERC20 to IERC20
import "./Interfaces/IIERC20.sol";
import "./Interfaces/IVAULT.sol";

contract CallActions {
    struct Vars {
        address vaultAddress;
        address collateralToken;
        uint256 collateralAmount;
        bool approveResponse;
        uint256 _allowance;
        uint256 _allowance1;
        address _sender;
        bool _break;
        uint256 balance;
        uint256 userBalance;
        uint256 userBalanceAfter;
    }

    function callMint(
        address _vaultAddress,
        address _collateralToken,
        uint256 _collateralAmount
    ) public returns (bool success) {
        Vars memory vars;

        vars.vaultAddress = _vaultAddress;
        vars.collateralToken = _collateralToken;
        vars.collateralAmount = _collateralAmount;
        vars._sender = msg.sender;


        vars.userBalance = IIERC20(_collateralToken).balanceOf(msg.sender);

        (bool success, bytes memory data) = 
            _collateralToken.delegatecall(
                    abi.encodeWithSignature("approve(address,uint256)", _vaultAddress, _collateralAmount));

        require(success, "Approve Delegatecall failed !");

        vars._allowance = IIERC20(_collateralToken).allowance(
            msg.sender,
            _vaultAddress
        );

        vars._allowance = IIERC20(_collateralToken).allowance(
            msg.sender,
            address(this)
        );
        

        vars._break = true;

        // 2. Mint
        //IVAULT(_vaultAddress).mint(_collateralAmount);
        success = vars.approveResponse;
    }
}
