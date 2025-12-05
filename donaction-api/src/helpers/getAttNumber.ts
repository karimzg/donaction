import { KlubDonEntity } from '../_types';

export default class GetAttNumber {
    private static instance: GetAttNumber;
    private static iteration = 0;
    private static LOCKED = false;

    private constructor() {}

    public static i() {
        if (!this.instance) this.instance = new GetAttNumber();
        return this.instance;
    }

    private async generateAttNumber(forceRandom = false) {
        try {
            GetAttNumber.LOCKED = true;
            const entries: Array<KlubDonEntity> = await strapi.db
                .query('api::klub-don.klub-don')
                .findMany({
                    select: ['attestationNumber'],
                    where: {
                        attestationNumber: { $notNull: true },
                        isContributionDonation: { $ne: true },
                    },
                    limit: 1,
                    orderBy: { attestationNumber: 'desc' },
                });
            const entry = entries[0];
            const month = new Date().getMonth() + 1;
            const monthStr = month < 10 ? `0${month}` : `${month}`;
            const prefix = `ATT-${new Date().getFullYear()}-${monthStr}`;
            const latestAttestationNumber = entry
                ? entry.attestationNumber
                : '';
            const latestAttestationNumberLastPart =
                (!!latestAttestationNumber &&
                    latestAttestationNumber.split('-')[3]) ||
                '0';
            const nextAttestationNumberLastPart =
                parseInt(latestAttestationNumberLastPart) + 1;
            const nextAttestationNumberLastPart5Digits =
                nextAttestationNumberLastPart.toString().padStart(5, '0');
            const result = `${prefix}-${nextAttestationNumberLastPart5Digits}${
                forceRandom
                    ? '-' + Math.floor(10000 + Math.random() * 90000)
                    : ''
            }`;
            const check: Array<KlubDonEntity> = await strapi.db
                .query('api::klub-don.klub-don')
                .findMany({
                    select: ['attestationNumber'],
                    where: {
                        attestationNumber: `${result}-CONTRIBUTION`,
                        isContributionDonation: true,
                    },
                    limit: 1,
                    orderBy: { attestationNumber: 'desc' },
                });
            if (check[0]) {
                return await this.generateAttNumber(true);
            }
            return result;
        } catch (e) {
            GetAttNumber.LOCKED = false;
        }
    }

    public static unlock() {
        GetAttNumber.LOCKED = false;
    }

    public async generate(forceRandom = false): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                while (GetAttNumber.LOCKED && !forceRandom) {
                    GetAttNumber.iteration += 1;
                    if (GetAttNumber.iteration > 20) {
                        GetAttNumber.LOCKED = false;
                        GetAttNumber.iteration = 0;
                    }
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
                resolve(await this.generateAttNumber(forceRandom));
            } catch (e) {
                console.log(e);
                GetAttNumber.unlock();
                reject(e);
            }
        });
    }
}
