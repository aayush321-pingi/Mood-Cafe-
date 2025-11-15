// Unified Booking Manager - syncs bookings across all pages (mood cafe, admin, dashboard)
// Uses localStorage for client-side demo; replace with server API for production

class BookingManager {
  constructor() {
    this.storageKey = 'moodCafeBookings';
    this.initializeData();
    // listen for storage events to keep cross-tab sync
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      if (e.key === this.storageKey) {
        try {
          const data = JSON.parse(e.newValue || '{}');
          // broadcast to local listeners that bookings changed
          this.broadcastChange('bookingDataUpdate', data);
        } catch (err) {
          console.warn('Failed to parse booking storage event', err);
        }
      }
    });
  }

  initializeData() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialBookings = {
        bookings: [],
        zones: [
          { id: 'z1', name: 'Couple Pod A1', description: 'Intimate 2-person space with mood lighting', capacity: 2, price: 499, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400' },
          { id: 'z2', name: 'Silent Pod S2', description: 'Quiet focus zone for work/meditation', capacity: 1, price: 299, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400' },
          { id: 'z3', name: 'Game Arena G3', description: 'Interactive gaming space with projection', capacity: 4, price: 699, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400' },
          { id: 'z4', name: 'Social Table ST4', description: 'Group gathering table with smart menu', capacity: 6, price: 799, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400' }
        ],
        events: [
          { id: 'e1', title: 'Weekend Wine Tasting', description: 'Curated wine pairing experience', date: '2025-11-16', time: '18:00', capacity: 20, price: 1999, booked: 0 },
          { id: 'e2', title: 'Coffee Masters Workshop', description: 'Learn latte art & brewing techniques', date: '2025-11-18', time: '10:00', capacity: 15, price: 999, booked: 0 }
        ]
      };
      this.saveData(initialBookings);
    }
  }

  getData() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || { bookings: [], zones: [], events: [] };
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    this.broadcastChange('bookingDataUpdate', data);
  }

  // Book a zone
  bookZone(zoneId, userName, email, date, time, seats) {
    const data = this.getData();
    const zone = data.zones.find(z => z.id === zoneId);
    if (!zone) return { ok: false, error: 'Zone not found' };
    if (seats > zone.capacity) return { ok: false, error: 'Exceeds zone capacity' };

    const booking = {
      id: Date.now(),
      type: 'zone',
      zoneId,
      zoneName: zone.name,
      userName,
      email,
      date,
      time,
      seats,
      total: zone.price * seats,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    data.bookings.push(booking);
    this.saveData(data);
    return { ok: true, booking };
  }

  // Book an event
  bookEvent(eventId, userName, email, ticketCount) {
    const data = this.getData();
    const event = data.events.find(e => e.id === eventId);
    if (!event) return { ok: false, error: 'Event not found' };
    if ((event.booked || 0) + ticketCount > event.capacity) return { ok: false, error: 'Event is full' };

    const booking = {
      id: Date.now(),
      type: 'event',
      eventId,
      eventTitle: event.title,
      userName,
      email,
      ticketCount,
      total: event.price * ticketCount,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    event.booked = (event.booked || 0) + ticketCount;
    data.bookings.push(booking);
    this.saveData(data);
    return { ok: true, booking };
  }

  // Get all bookings
  getBookings() {
    return this.getData().bookings || [];
  }

  // Get zones
  getZones() {
    return this.getData().zones || [];
  }

  // Get events
  getEvents() {
    return this.getData().events || [];
  }

  // Broadcast changes so other tabs/pages stay in sync
  broadcastChange(type, payload) {
    const event = new CustomEvent('bookingManagerUpdate', {
      detail: { type, payload }
    });
    window.dispatchEvent(event);
  }
}

window.bookingManager = new BookingManager();
