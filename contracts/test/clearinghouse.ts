import { expect } from "chai";
import { ethers } from "hardhat";

const LOAN = ethers.id("veridex-facility-1");

describe("VeridexClearinghouse", () => {
  async function deploy() {
    const [first, second] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("VeridexClearinghouse");
    const house = await Factory.deploy(first.address, 11155111);
    await house.waitForDeployment();
    return { house, first, second };
  }

  it("pays the first confirmed wallet first", async () => {
    const { house, first, second } = await deploy();
    await house.connect(first).fund(LOAN, { value: ethers.parseEther("1") });
    await house.connect(second).fund(LOAN, { value: ethers.parseEther("1") });
    await house.connect(first).repay(LOAN, { value: ethers.parseEther("1") });

    await expect(house.connect(second).getPaidBack(LOAN)).to.be.revertedWith("not your turn");
    await expect(house.connect(first).getPaidBack(LOAN)).to.changeEtherBalance(
      first,
      ethers.parseEther("1"),
    );
  });

  it("needs the payout pot before anyone is paid", async () => {
    const { house, first } = await deploy();
    await house.connect(first).fund(LOAN, { value: ethers.parseEther("1") });
    await expect(house.connect(first).getPaidBack(LOAN)).to.be.revertedWith(
      "loan has not paid back enough",
    );
  });
});
