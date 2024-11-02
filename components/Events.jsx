import { fetchFromStrapi } from '../../lib/api';

export default async function EventsPage() {
    const events = await fetchFromStrapi('events');
    return (
        <div className="events">
            <h1>Upcoming Events</h1>
            {events.data.map(event => (
                <div key={event.id}>
                    <h2>{event.attributes.title}</h2>
                    <p>{event.attributes.description}</p>
                </div>
            ))}
        </div>
    );
}
