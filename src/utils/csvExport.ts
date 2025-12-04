import { RegistrationData } from '../App';

export const exportToCSV = (registrations: RegistrationData[]) => {
    const headers = ['ID', 'Date', 'Time', 'Name', 'Email', 'Phone', 'Car', 'Registered At'];
    const rows = registrations.map(r => [
        r.registrationId,
        r.date,
        r.timeSlot,
        `${r.firstName} ${r.lastName}`,
        r.email,
        r.phone,
        `${r.car?.name} ${r.car?.model}`,
        new Date(r.registeredAt || '').toLocaleString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-drive-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
};
