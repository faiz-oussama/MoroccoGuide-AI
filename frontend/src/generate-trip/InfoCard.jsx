export default function InfoCard({ icon, title, value }) {
  return (
    <div className="flex items-start p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}