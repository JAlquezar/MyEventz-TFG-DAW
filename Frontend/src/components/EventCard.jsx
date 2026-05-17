import { Link } from 'react-router-dom';

export default function EventCard({ id, image, title, date, location, attendees, compact = false }) {
  return (
    <Link to={`/event/${id}`} className={`event-card ${compact ? 'event-card--compact' : ''}`}>
      <div className="event-card__image">
        <img src={image} alt={title} />
        <span className="event-card__attendees">{attendees}</span>
      </div>
      <div className="event-card__body">
        <h3 className="event-card__title">{title}</h3>
        <p className="event-card__date">{date}</p>
        {!compact && location && <p className="event-card__location">{location}</p>}
      </div>
    </Link>
  );
}
