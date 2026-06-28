import { expect } from "chai";
import { ethers } from "hardhat";

describe("ArcPassportSBT", function () {
  const metadataURI = "ipfs://arcpassport/1.json";

  async function deployContract() {
    const [owner, builder, secondBuilder] = await ethers.getSigners();
    const ArcPassportSBT = await ethers.getContractFactory("ArcPassportSBT");
    const passport = await ArcPassportSBT.deploy(owner.address);

    await passport.waitForDeployment();

    return {
      owner,
      builder,
      secondBuilder,
      passport,
    };
  }

  it("deploys locally", async function () {
    const { owner, passport } = await deployContract();

    expect(await passport.name()).to.equal("ArcPassport Builder Passport");
    expect(await passport.symbol()).to.equal("ARCPASS");
    expect(await passport.owner()).to.equal(owner.address);
  });

  it("allows the owner/admin to mint a passport", async function () {
    const { builder, passport } = await deployContract();

    await expect(passport.mintPassport(builder.address, metadataURI))
      .to.emit(passport, "PassportMinted")
      .withArgs(builder.address, 1n, metadataURI);

    expect(await passport.ownerOf(1n)).to.equal(builder.address);
  });

  it("prevents one wallet from receiving more than one passport", async function () {
    const { builder, passport } = await deployContract();

    await passport.mintPassport(builder.address, metadataURI);

    await expect(
      passport.mintPassport(builder.address, "ipfs://arcpassport/second.json")
    )
      .to.be.revertedWithCustomError(passport, "PassportAlreadyMinted")
      .withArgs(builder.address);
  });

  it("sets tokenURI correctly", async function () {
    const { builder, passport } = await deployContract();

    await passport.mintPassport(builder.address, metadataURI);

    expect(await passport.tokenURI(1n)).to.equal(metadataURI);
  });

  it("tracks wallet to token id mapping", async function () {
    const { builder, passport } = await deployContract();

    await passport.mintPassport(builder.address, metadataURI);

    expect(await passport.passportOf(builder.address)).to.equal(1n);
    expect(await passport.tokenIdOf(builder.address)).to.equal(1n);
  });

  it("blocks transferFrom", async function () {
    const { builder, secondBuilder, passport } = await deployContract();

    await passport.mintPassport(builder.address, metadataURI);

    await expect(
      passport
        .connect(builder)
        .transferFrom(builder.address, secondBuilder.address, 1n)
    ).to.be.revertedWithCustomError(passport, "SoulboundToken");
  });

  it("blocks safeTransferFrom", async function () {
    const { builder, secondBuilder, passport } = await deployContract();

    await passport.mintPassport(builder.address, metadataURI);

    await expect(
      passport
        .connect(builder)
        ["safeTransferFrom(address,address,uint256)"](
          builder.address,
          secondBuilder.address,
          1n
        )
    ).to.be.revertedWithCustomError(passport, "SoulboundToken");

    await expect(
      passport
        .connect(builder)
        ["safeTransferFrom(address,address,uint256,bytes)"](
          builder.address,
          secondBuilder.address,
          1n,
          "0x"
        )
    ).to.be.revertedWithCustomError(passport, "SoulboundToken");
  });

  it("allows the token holder to burn", async function () {
    const { builder, passport } = await deployContract();

    await passport.mintPassport(builder.address, metadataURI);
    await passport.connect(builder).burn(1n);

    expect(await passport.passportOf(builder.address)).to.equal(0n);
    await expect(passport.ownerOf(1n)).to.be.reverted;
  });

  it("allows the owner/admin to burn", async function () {
    const { builder, passport } = await deployContract();

    await passport.mintPassport(builder.address, metadataURI);
    await passport.burn(1n);

    expect(await passport.passportOf(builder.address)).to.equal(0n);
    await expect(passport.ownerOf(1n)).to.be.reverted;
  });

  it("prevents non-owner minting", async function () {
    const { builder, passport } = await deployContract();

    await expect(
      passport.connect(builder).mintPassport(builder.address, metadataURI)
    )
      .to.be.revertedWithCustomError(passport, "OwnableUnauthorizedAccount")
      .withArgs(builder.address);
  });
});
