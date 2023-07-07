import crypto, { BinaryLike } from 'crypto';
export default class Encrypt {

    static md5(data: BinaryLike) {
        // 以md5的格式创建一个哈希值
        let hash = crypto.createHash('md5');
        return hash.update(data).digest('hex');
    }

    static base64ToStr(str:string) {
        return Buffer.from(str, 'base64').toString()
    }
}