'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  Clock,
  TrendingUp,
  Mic
} from 'lucide-react';
import Layout from '@/components/Layout';
import { IRoom } from '@/models/Room';
import { ICustomer } from '@/models/Customer';
import { IBooking } from '@/models/Booking';
import { format, isToday, isTomorrow } from 'date-fns';

export default function Dashboard() {
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [roomsRes, customersRes, bookingsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/customers'),
        fetch(`/api/bookings?date=${today}`),
      ]);
      
      const roomsData = await roomsRes.json();
      const customersData = await customersRes.json();
      const bookingsData = await bookingsRes.json();
      
      setRooms(roomsData);
      setCustomers(customersData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(room => room.status === 'available').length;
    const occupiedRooms = totalRooms - availableRooms;
    const totalCustomers = customers.length;
    const todayBookings = bookings.length;
    const activeBookings = bookings.filter(booking => booking.status === 'booked').length;

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      totalCustomers,
      todayBookings,
      activeBookings,
    };
  };

  const getRecentBookings = () => {
    return bookings
      .filter(booking => booking.status === 'booked')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  };

  const getRoomName = (roomId: any) => {
    const room = rooms.find(r => r._id === (roomId._id || roomId));
    return room ? room.roomNumber : 'Unknown Room';
  };

  const getCustomerName = (customerId: any) => {
    const customer = customers.find(c => c._id === (customerId._id || customerId));
    return customer ? customer.name : 'Unknown Customer';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  const stats = getStats();
  const recentBookings = getRecentBookings();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Mic className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Rooms
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalRooms}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">
                  {stats.availableRooms} available
                </span>
                <span className="text-gray-500"> • </span>
                <span className="text-red-600 font-medium">
                  {stats.occupiedRooms} occupied
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Customers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalCustomers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Today's Bookings
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.todayBookings}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-blue-600 font-medium">
                  {stats.activeBookings} active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Today's Bookings
            </h3>
            {recentBookings.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <li key={booking._id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getCustomerName(booking.customerId)}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Room {getRoomName(booking.roomId)} • {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings today</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new booking.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="/rooms"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                    <Building2 className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    Manage Rooms
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add, edit, or remove karaoke rooms
                  </p>
                </div>
              </a>

              <a
                href="/customers"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <Users className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    Manage Customers
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add, edit, or remove customer information
                  </p>
                </div>
              </a>

              <a
                href="/bookings"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                    <Calendar className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    Manage Bookings
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Create, edit, or cancel bookings
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

