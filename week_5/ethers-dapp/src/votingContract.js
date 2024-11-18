export const votingContractAddress =
  "0xB2E1185468e57A801a54162F27725CbD5B0EB4a6";

export const votingContractABI = [
  {
    constant: false,
    inputs: [{ name: "proposal", type: "uint256" }],
    name: "vote",
    outputs: [],
    type: "function",
  },
];
