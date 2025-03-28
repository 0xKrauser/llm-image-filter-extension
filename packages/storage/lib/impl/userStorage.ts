import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type UserStorageContent = {
  firstLogin: boolean;
};

export type UserStorage = BaseStorage<UserStorageContent> & {
  markFirstLogin: () => Promise<void>;
};

const storage = createStorage<UserStorageContent>(
  'user-storage-key',
  {
    firstLogin: true,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const userStorage: UserStorage = {
  ...storage,
  markFirstLogin: async () => {
    await storage.set(prev => ({
      ...prev,
      firstLogin: false,
    }));
  },
};
