import { ethers } from "hardhat";

async function main() {
  console.log("Deploying FilmRental contract...");

  const FilmRental = await ethers.getContractFactory("FilmRental");
  const filmRental = await FilmRental.deploy();

  await filmRental.waitForDeployment();

  const address = await filmRental.getAddress();
  console.log(`FilmRental deployed to: ${address}`);
  
  console.log("Adding sample films...");
  
  // Add some sample films
  await filmRental.addFilm("movie1", ethers.parseEther("0.01"));
  await filmRental.addFilm("movie2", ethers.parseEther("0.02"));
  await filmRental.addFilm("movie3", ethers.parseEther("0.015"));
  
  console.log("Sample films added successfully!");
  
  // Important: Update this address in your Web3Context.tsx and services/filmRental/index.ts files
  console.log(`\nIMPORTANT: Update CONTRACT_ADDRESS in your code with: "${address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
