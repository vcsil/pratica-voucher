import { jest } from '@jest/globals';

import voucherService from './../../src/services/voucherService';
import voucherRepository from "./../../src/repositories/voucherRepository";
import newVoucher from '../factories/createVoucher';
import * as errors from '../../src/utils/errorUtils'


describe("voucherService test suite", () => {
  it("Must create voucher", async () => {
    jest.spyOn(voucherRepository,"getVoucherByCode").mockImplementation(() => {
      return undefined
    })
    jest.spyOn(voucherRepository,"createVoucher").mockImplementation(() => {
      return undefined
    })

    const { code, discount } = newVoucher();

    await voucherService.createVoucher(code, discount);

    expect(voucherRepository.getVoucherByCode).toBeCalled();
  })

  it("Must not create duplicate voucher", async () => {
    const {code, discount} = newVoucher();

    jest.spyOn(voucherRepository,"getVoucherByCode").mockImplementationOnce((): any => {
      return {
        id: 1,
        code,
        discount,
        used: false
      }
    })

    try {
      const buscaVoucherPromise = await voucherService.createVoucher(code, discount);
    } catch (error) {
      expect(error).toEqual(errors.conflictError("Voucher already exist."))
    }
  })

  it("Must apply discount", async () => {
    const {code, discount} = newVoucher();

    jest.spyOn(voucherRepository,"getVoucherByCode").mockImplementationOnce((): any => {
      return {
        id: 1,
        code: code,
        discount: discount,
        used: false
      }
    });
    jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce((): any => { });

    const amount = 1000;
    const order = await voucherService.applyVoucher(code, amount);

    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(discount);
    expect(order.finalAmount).toBe(amount - (amount * (discount / 100)));
  })

  it("Must not apply discount for values below 100", async () => {
    const {code, discount} = newVoucher();

    jest.spyOn(voucherRepository,"getVoucherByCode").mockImplementationOnce((): any => {
      return {
        id: 1,
        code: code,
        discount: discount,
        used: false
      }
    });
    jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce((): any => { });

    const amount = 99;
    const order = await voucherService.applyVoucher(code, amount);
    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(discount);
    expect(order.finalAmount).toBe(amount);
  })

  it("Must not apply discount for used voucher", async () => {
    const {code, discount} = newVoucher();

    jest.spyOn(voucherRepository,"getVoucherByCode").mockImplementationOnce((): any => {
      return {
        id: 1,
        code: code,
        discount: discount,
        used: true
      }
    });

    const amount = 1000;
    const order = await voucherService.applyVoucher(code, amount);
    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(discount);
    expect(order.finalAmount).toBe(amount);
    expect(order.applied).toBe(false);
  })

  it("Must not apply discount for invalid voucher", async () => {
    const { code } = newVoucher();

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
      return undefined;
    });

    const amount = 1000;
    

    try {
      const aplicandoVoucherPromise = await voucherService.applyVoucher(code, amount);
    } catch (error) {
      expect(error).toEqual(errors.conflictError("Voucher does not exist."));
    }
  })
})