import { faker } from "@faker-js/faker";

export default function newVoucher() {
    const newVoucher = {
        code: faker.random.alphaNumeric(7),
        discount: parseInt(faker.random.numeric(2))
    }

    return newVoucher
}