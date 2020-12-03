pragma solidity >=0.4.22 <0.8.0;

// To Do : rename IIERC20 to IERC20
import "./Interfaces/IERC20.sol";
import "./Interfaces/IVAULT.sol";

contract CallActions {

    struct Vars {
        IERC20 primaryToken;
        IERC20 complementToken;
        uint256 primaryTokenBalance;
        uint256 complementTokenBalance;
    }


    function callMint(
        address _vaultAddress,
        address _collateralToken,
        uint256 _collateralAmount
    ) public  {
        
        Vars memory vars;
        
        IERC20 token = IERC20(_collateralToken);
        IVAULT vault = IVAULT(_vaultAddress);

        vars.primaryToken = IERC20(vault.primaryToken());
        vars.complementToken = IERC20(vault.complementToken());

        // 1. Transfer collateral tokens from users wallet to ProxyContract
        require(token.transferFrom(msg.sender, address(this), _collateralAmount), "ERR_TRANSFER_FAILED");

        // 2. Approve collateral Tokens for Vault Contract
        token.approve(_vaultAddress,_collateralAmount);

        // 3. Call Vault Mint function
        vault.mint(_collateralAmount);

        vars.primaryTokenBalance = vars.primaryToken.balanceOf(address(this));
        vars.complementTokenBalance = vars.complementToken.balanceOf(address(this));

        // 4. Transfer Primary & Complement tokens to user wallet
        require( vars.primaryToken.transfer(msg.sender,vars.primaryTokenBalance), "ERR_TRANSFER_PRIMARY_TOKEN");
        require(vars.complementToken.transfer(msg.sender,vars.complementTokenBalance), "ERR_TRANSFER_COMPLEMENT_TOKEN");
    }

    // To Do Remove :
    // DelegateCall version 
    // function callMintDelegate(
    //     address _vaultAddress,
    //     address _collateralToken,
    //     uint256 _collateralAmount
    // ) public returns (bool success) {
    //     Vars memory vars;

    //     vars.vaultAddress = _vaultAddress;
    //     vars.collateralToken = _collateralToken;
    //     vars.collateralAmount = _collateralAmount;
    //     vars._sender = msg.sender;

    //     vars.userBalance = IIERC20(_collateralToken).balanceOf(msg.sender);

    //     // 1. Approve Tokens 
    //     // Delegate Call : forward origin msg.sender to the conllateral token 
    //     // ! DelegateCall cant change collateral token storage
    //     (bool success, bytes memory data) = 
    //         _collateralToken.delegatecall(
    //                 abi.encodeWithSignature("approve(address,uint256)", _vaultAddress, _collateralAmount));

    //     require(success, "Approve Delegatecall failed !");

    //     vars._allowance = IIERC20(_collateralToken).allowance(
    //         msg.sender,
    //         _vaultAddress
    //     );

    //     require(vars._allowance != 0, "Allowance == 0");

    //     // 2. Mint
    //     IVAULT(_vaultAddress).mint(_collateralAmount);
    //     success = vars.approveResponse;
    // }

}
