import { Tab } from '@headlessui/react';

function TabButton({ children, icon: Icon }) {
  return (
    <Tab
      className={({ selected }) =>
        `${selected 
          ? 'bg-white text-indigo-600 shadow'
          : 'text-gray-600 hover:text-indigo-600 hover:bg-white/[0.12]'
        } relative rounded-lg px-4 py-3 w-full flex items-center justify-center space-x-2
        font-medium text-sm focus:outline-none`
      }
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </Tab>
  );
}

export default TabButton;