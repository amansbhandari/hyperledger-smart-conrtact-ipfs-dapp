/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

class NotarySmartContract008 extends Contract {
  /**
   *
   * @param {*} ctx context
   * @param {*} deliverableAssetsId key if the buyer or seller signature
   * @returns if the buyer's or seller's object exists or not
   */
  async assetExists008(ctx, deliverableAssetsId) {
    const buffer = await ctx.stub.getState(deliverableAssetsId);
    return !!buffer && buffer.length > 0;
  }

  /**
   *
   * @param {*} ctx context
   * @param {*} deliverableAssetsId key if the buyer or seller signature
   * @param {*} value status of the aggreement accept or rejected
   */
  async approveOrCancelAgreement008(ctx, deliverableAssetsId, value) {
    const exists = await this.assetExists008(ctx, deliverableAssetsId);

    if (!exists) {
      throw new Error(`The agreement ${deliverableAssetsId} does not exist`);
    }

    const asset = await this.readAssets008(ctx, deliverableAssetsId); //get asset
    asset.status = value; //change the status to approved
    const buffer = Buffer.from(JSON.stringify(asset)); //stringify it
    await ctx.stub.putState(deliverableAssetsId, buffer); //update it
  }

  /**
   *
   * @param {*} ctx context
   * @param {*} deliverableAssetsId key of the sign of either buyer or seller
   * @param {*} value signature of buyer or seller
   */
  async createAssets008(ctx, deliverableAssetsId, value) {
    const exists = await this.assetExists008(ctx, deliverableAssetsId);

    if (exists) {
      throw new Error(`The agreement ${deliverableAssetsId} already exists`);
    }
    const status = "";
    const asset = { signature: value, status };
    const buffer = Buffer.from(JSON.stringify(asset));
    await ctx.stub.putState(deliverableAssetsId, buffer);
  }

  /**
   *
   * @param {*} ctx context
   * @param {*} deliverableAssetsId key if the buyer or seller signature
   * @returns object of the signature of buyer or seller
   */
  async readAssets008(ctx, deliverableAssetsId) {
    const exists = await this.assetExists008(ctx, deliverableAssetsId);
    if (!exists) {
      throw new Error(`The agreement ${deliverableAssetsId} does not exist`);
    }
    const buffer = await ctx.stub.getState(deliverableAssetsId);
    const asset = JSON.parse(buffer.toString());
    return asset;
  }

  /**
   *
   * @param {*} ctx context
   * @param {*} deliverableAssetsId key if the buyer or seller signature
   * @param {*} newValue new value of digital signature
   */
  async updateAssets008(ctx, deliverableAssetsId, newValue) {
    const exists = await this.assetExists008(ctx, deliverableAssetsId);
    if (!exists) {
      throw new Error(`The agreement ${deliverableAssetsId} does not exist`);
    }
    const status = "";
    const asset = { agreement: newValue, status };
    const buffer = Buffer.from(JSON.stringify(asset));
    await ctx.stub.putState(deliverableAssetsId, buffer);
  }

  /**
   *
   * @param {*} ctx context
   * @param {*} deliverableAssetsId key if the buyer or seller signature
   */
  async deleteAssets008(ctx, deliverableAssetsId) {
    const exists = await this.assetExists008(ctx, deliverableAssetsId);
    if (!exists) {
      throw new Error(`The agreement ${deliverableAssetsId} does not exist`);
    }
    await ctx.stub.deleteState(deliverableAssetsId);
  }
}

module.exports = NotarySmartContract008;
