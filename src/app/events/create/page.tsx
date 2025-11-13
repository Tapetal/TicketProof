// src/app/events/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  DollarSign,
  Ticket,
  Image as ImageIcon,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    totalTickets: '',
    category: 'conference',
    imageUrl: '',
    organizerName: ''
  });

  const [features, setFeatures] = useState<string[]>(['']);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      const validFeatures = features.filter(f => f.trim() !== '');

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          date: eventDateTime.toISOString(),
          location: formData.location,
          price: parseFloat(formData.price),
          totalTickets: parseInt(formData.totalTickets),
          category: formData.category,
          imageUrl:
            formData.imageUrl ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
          organizerId: 'user_123', // replace with real user ID
          organizerName: formData.organizerName || 'Event Organizer',
          features:
            validFeatures.length > 0
              ? validFeatures
              : [
                  '🎤 Amazing Experience',
                  '🤝 Networking Opportunities',
                  '🎁 Exclusive Perks',
                  '📜 NFT Certificate',
                  '🛠️ Hands-on Workshops',
                  '🍽️ Catered Lunch'
                ]
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create event');
      }

      toast.success('Event created successfully!');
      alert(
        `Event created successfully!\nEvent ID: ${data.eventId}\nHedera Token: ${data.hederaTokenId}`
      );

      router.push(`/events/${data.eventId}`);
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const addFeature = () => setFeatures([...features, '']);
  const removeFeature = (index: number) =>
    setFeatures(features.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-[#0B0B14] py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-[#6C63FF] hover:text-[#FFB400] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </Link>
          <h1 className="text-4xl font-bold mt-4 mb-2">
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#FFB400] to-[#00C6AE] bg-clip-text text-transparent">
              Create New Event
            </span>
          </h1>
          <p className="text-[#D1D5DB]">
            Launch your event with blockchain-verified NFT tickets
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-8 space-y-6"
        >
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
              Event Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Web3 Music Festival 2025"
              required
              className="w-full px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
            />
          </div>

          {/* Organizer Name */}
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
              Organizer Name *
            </label>
            <input
              type="text"
              name="organizerName"
              value={formData.organizerName}
              onChange={handleChange}
              placeholder="e.g., Hedera Foundation"
              required
              className="w-full px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
            >
              <option value="concert">🎵 Concert</option>
              <option value="conference">💼 Conference</option>
              <option value="sports">⚽ Sports</option>
              <option value="theater">🎭 Theater</option>
              <option value="other">📌 Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell attendees what makes your event special..."
              rows={5}
              required
              className="w-full px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all resize-none"
            />
            <p className="text-sm text-[#D1D5DB]/60 mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Madison Square Garden, New York"
              required
              className="w-full px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
            />
          </div>

          {/* Price & Tickets */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Ticket Price (HBAR) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="50"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                <Ticket className="w-4 h-4 inline mr-1" />
                Total Tickets *
              </label>
              <input
                type="number"
                name="totalTickets"
                value={formData.totalTickets}
                onChange={handleChange}
                placeholder="500"
                min="1"
                required
                className="w-full px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
              Event Features
            </label>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={e => handleFeatureChange(index, e.target.value)}
                    placeholder="e.g., 🎤 20+ Industry Speakers"
                    className="flex-1 px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 px-4 py-2 bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[#6C63FF] rounded-lg hover:bg-[#6C63FF]/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>
          </div>

          {/* Image URL & Preview */}
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Event Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/event-image.jpg"
              className="w-full px-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
            />
            {formData.imageUrl && (
              <div className="rounded-lg overflow-hidden border-2 border-[#6C63FF]/20 mt-3">
                <img
                  src={formData.imageUrl}
                  alt="Event preview"
                  className="w-full h-48 object-cover"
                  onError={e => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200';
                  }}
                />
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-[#6C63FF]/10 border border-[#6C63FF]/20 rounded-lg p-4">
            <h4 className="font-semibold text-[#6C63FF] mb-2">🎫 What happens next?</h4>
            <ul className="text-sm text-[#D1D5DB] space-y-1">
              <li>• Your event will be created on Hedera blockchain</li>
              <li>• NFT tickets will be minted per attendee purchase</li>
              <li>• You can track sales in your dashboard</li>
              <li>• Attendees get verifiable proof of purchase</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border-2 border-[#6C63FF]/20 text-[#D1D5DB] py-3 rounded-lg font-semibold hover:bg-[#6C63FF]/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white py-3 rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creating Event...
                </span>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-white">💡 Tips for Success</h3>
          <ul className="space-y-2 text-[#D1D5DB]">
            <li>• Use a clear, descriptive event name</li>
            <li>• Add a high-quality banner image</li>
            <li>• Write a compelling description</li>
            <li>• Price tickets competitively</li>
            <li>• Add exciting features for attendees</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
