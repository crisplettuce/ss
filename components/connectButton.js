import { ConnectKitButton } from "connectkit";

// authentication is performed by: https://docs.family.co/connectkit

import styled from "styled-components";
const StyledButton = styled.button`
 
`;

export default function ConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <button style={{color:'black'}} onClick={show}>
            {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

/*const StyledButton = styled.button`
  cursor: pointer;
  padding: 14px 24px;
  color: #ffffff;
  background: #1a88f8;
  font-size: 16px;
  font-weight: 500;
  border-radius: 10rem;
  box-shadow: 0 4px 24px -6px #1a88f8;

  transition: 200ms ease;
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 6px 40px -6px #1a88f8;
  }
  &:active {
    transform: translateY(-3px);
    box-shadow: 0 6px 32px -6px #1a88f8;
  }
`;*/