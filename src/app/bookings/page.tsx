'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import { IBooking } from '@/models/Booking';
import { IRoom } from '@/models/Room';
import { ICustomer } from '@/models/Customer';
import { format } from 'date-fns';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<IBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    roomId: '',
    customerId: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'booked' as 'booked' | 'completed' | 'cancelled',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchBookings();
    }
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const [roomsRes, customersRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/customers'),
      ]);
      
      const roomsData = await roomsRes.json();
      const customersData = await customersRes.json();
      
      setRooms(roomsData);
      setCustomers(customersData);
      
      await fetchBookings();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?date=${selectedDate}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const url = editingBooking ? `/api/bookings/${editingBooking._id}` : '/api/bookings';
      const method = editingBooking ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.error ? { general: errorData.error } : {});
        return;
      }

      await fetchBookings();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving booking:', error);
      setErrors({ general: 'Failed to save booking' });
    }
  };

  const handleEdit = (booking: IBooking) => {
    setEditingBooking(booking);
    setFormData({
      roomId: booking.roomId._id || booking.roomId.toString(),
      customerId: booking.customerId._id || booking.customerId.toString(),
      date: new Date(booking.date).toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (booking: IBooking) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`/api/bookings/${booking._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBookings();
      } else {
        alert('Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBooking(null);
    setFormData({
      roomId: '',
      customerId: '',
      date: selectedDate,
      startTime: '',
      endTime: '',
      status: 'booked',
    });
    setErrors({});
  };

  const getRoomName = (roomId: any) => {
    const room = rooms.find(r => r._id === (roomId._id || roomId));
    return room ? room.roomNumber : 'Unknown Room';
  };

  const getCustomerName = (customerId: any) => {
    const customer = customers.find(c => c._id === (customerId._id || customerId));
    return customer ? customer.name : 'Unknown Customer';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'roomId',
      header: 'Room',
      render: (booking: IBooking) => getRoomName(booking.roomId),
    },
    {
      key: 'customerId',
      header: 'Customer',
      render: (booking: IBooking) => getCustomerName(booking.customerId),
    },
    {
      key: 'startTime',
      header: 'Start Time',
    },
    {
      key: 'endTime',
      header: 'End Time',
    },
    {
      key: 'status',
      header: 'Status',
      render: (booking: IBooking) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading bookings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Booking
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <Table
            data={bookings}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage={`No bookings found for ${format(new Date(selectedDate), 'MMMM dd, yyyy')}.`}
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingBooking ? 'Edit Booking' : 'Add New Booking'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="text-red-600 text-sm">{errors.general}</div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Room
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.roomNumber} (Capacity: {room.capacity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Customer
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={errors.date}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                error={errors.startTime}
                required
              />
              
              <Input
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                error={errors.endTime}
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'booked' | 'completed' | 'cancelled' })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingBooking ? 'Update' : 'Create'} Booking
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}

