import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { getAllOrders, getOrders } from '../../services/slices/orders';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();

  /** TODO: взять переменную из стора */
  const orders = useSelector(getAllOrders);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
