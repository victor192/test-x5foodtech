import { InputRequest } from '../interfaces/input-request.interface';

export const requests: InputRequest[] = [
  {
    name: 'getUser',
    url: '/get-user',
    method: 'GET',
    params: {
      id: 'id',
    },
  },
  {
    name: 'getAddressCoordinate',
    url: '/get-address-coordinate',
    method: 'POST',
    important: false,
    params: {
      id: 'getUser.id',
    },
  },
  {
    name: 'getUsersFriend',
    url: '/get-users-friend',
    method: 'POST',
    important: true,
    params: {
      address_id: 'getAddressCoordinate.id',
    },
  },
  {
    name: 'getBestFriend',
    url: '/get-user',
    method: 'GET',
    important: false,
    params: {
      id: 'getUsersFriend.address_id',
    },
  },
];
