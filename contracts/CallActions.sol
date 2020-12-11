pragma solidity >=0.4.22 <0.8.0;

import "./Interfaces/IERC20.sol";
import "./Interfaces/IVAULT.sol";

contract CallActions {

    struct Vars {
        IERC20 primaryToken;
        IERC20 complementToken;
        IERC20 collateralToken;
        uint256 primaryTokenBalance;
        uint256 complementTokenBalance;
    }

    function callMint(
        address _vault,
        address _collateral,
        uint256 _tokenAmount
    ) public {
        
        Vars memory vars;
        
        IERC20 token = IERC20(_collateral);
        IVAULT vault = IVAULT(_vault);

        vars.primaryToken = IERC20(vault.primaryToken());
        vars.complementToken = IERC20(vault.complementToken());

        // 1. Transfer collateral tokens from users wallet to ProxyContract
        require(token.transferFrom(msg.sender, address(this), _tokenAmount), "ERR_TRANSFER_FAILED");

        // 2. Approve collateral Tokens for Vault Contract
        token.approve(_vault, _tokenAmount);

        // 3. Call Vault Mint function
        vault.mint(_tokenAmount);

        vars.primaryTokenBalance = vars.primaryToken.balanceOf(address(this));
        vars.complementTokenBalance = vars.complementToken.balanceOf(address(this));

        // 4. Transfer Minted Primary & Complement tokens to user wallet
        require(vars.primaryToken.transfer(msg.sender,vars.primaryTokenBalance), "ERR_TRANSFER_PRIMARY_TOKEN");
        require(vars.complementToken.transfer(msg.sender,vars.complementTokenBalance), "ERR_TRANSFER_COMPLEMENT_TOKEN");
    }

    function callRefund(uint256 _tokenAmount, address _vault) public {
        Vars memory vars;
        IVAULT vault = IVAULT(_vault);

        // 1. Get Primary & ComplementTokens from Vault contract
        vars.primaryToken = IERC20(vault.primaryToken());
        vars.complementToken = IERC20(vault.complementToken());

        // 2.Execute TransferFrom users wallet to ProxyContract

        // Transfer primary Token
        require(vars.primaryToken.transferFrom(msg.sender, address(this), _tokenAmount), "ERR_TRANSFER_FAILED");
        require(vars.complementToken.transferFrom(msg.sender, address(this), _tokenAmount), "ERR_TRANSFER_FAILED");

        vars.primaryToken.approve(_vault, _tokenAmount);
        vars.complementToken.approve(_vault, _tokenAmount);

        // 3.Execute Refund
        vault.refund(_tokenAmount);

        // 4.Transfer collateral Back to wallet

    }

    function callredeem(
        address _vault,
        uint256 _primaryTokenAmount,
        uint256 _complementTokenAmount,
        uint256[] memory _underlyingStartRoundHints,
        uint256[] memory _underlyingEndRoundHints) public {

        Vars memory vars;
        IVAULT vault = IVAULT(_vault);

    }
}
