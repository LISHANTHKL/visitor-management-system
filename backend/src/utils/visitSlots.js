export const OFFICE_START_MINUTES = 9 * 60;
export const OFFICE_END_MINUTES = 18 * 60;
export const VISIT_DURATION_MINUTES = 15;
export const UNAVAILABLE_VISITOR_REQUEST_STATUSES = ['pending', 'approved'];

const padTime = (value) => String(value).padStart(2, '0');

const formatSlot = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${padTime(hours)}:${padTime(minutes)}`;
};

export const generateVisitSlots = () => {
  const slots = [];

  for (
    let currentMinutes = OFFICE_START_MINUTES;
    currentMinutes + VISIT_DURATION_MINUTES <= OFFICE_END_MINUTES;
    currentMinutes += VISIT_DURATION_MINUTES
  ) {
    slots.push(formatSlot(currentMinutes));
  }

  return slots;
};

export const isValidVisitSlot = (slot) => generateVisitSlots().includes(slot);

export const getVisitDateRange = (date) => {
  if (!date) {
    return null;
  }

  const dateValue = String(date).trim();
  let dateKey = dateValue;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    dateKey = parsedDate.toISOString().slice(0, 10);
  }

  const start = new Date(`${dateKey}T00:00:00.000Z`);

  if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== dateKey) {
    return null;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    dateKey,
    start,
    end
  };
};
