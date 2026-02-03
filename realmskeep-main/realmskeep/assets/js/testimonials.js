const track = document.getElementById('testimonials-track');

if (track) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const createCard = (testimonial) => {
    const card = document.createElement('article');
    card.className = 'testimonial-card';

    const quote = document.createElement('p');
    quote.className = 'testimonial-quote';
    quote.textContent = `“${testimonial.quote}”`;

    const name = document.createElement('p');
    name.className = 'testimonial-name';
    name.textContent = testimonial.name;

    const role = document.createElement('p');
    role.className = 'testimonial-role';
    role.textContent = testimonial.role;

    card.append(quote, name, role);

    return card;
  };

  fetch('./assets/data/testimonials.json')
    .then((response) => response.json())
    .then((testimonials) => {
      testimonials.forEach((testimonial) => {
        track.appendChild(createCard(testimonial));
      });

      if (!prefersReducedMotion) {
        testimonials.forEach((testimonial) => {
          track.appendChild(createCard(testimonial));
        });
      } else {
        track.classList.add('is-reduced');
      }
    })
    .catch((error) => {
      console.error('Failed to load testimonials', error);
    });
}
