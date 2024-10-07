import { STORAGE_KEYS } from '../constants/system.const';

export const clearStore = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

export const isEqualObj = (obj1: any, obj2: any) => {
  // Kiểm tra nếu cả hai là null hoặc undefined hoặc chuỗi rỗng
  if (obj1 === null || obj1 === undefined || obj1 === "") obj1 = null;
  if (obj2 === null || obj2 === undefined || obj2 === "") obj2 = null;
  if (obj1 === null && obj2 === null) return true;

  // Kiểm tra nếu cả hai có cùng kiểu dữ liệu
  if (typeof obj1 !== typeof obj2) return false;

  // Kiểm tra nếu cả hai là kiểu dữ liệu cơ bản (primitive)
  if (typeof obj1 !== 'object') return obj1 === obj2;

  // Kiểm tra nếu cả hai là mảng
  if (Array.isArray(obj1)) {
    if (!Array.isArray(obj2)) return false;
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!isEqualObj(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  // Kiểm tra nếu cả hai là object
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isEqualObj(obj1[key], obj2[key])) return false;
  }

  return true;
};
