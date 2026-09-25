import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { AndroidFrame } from './components/AndroidFrame';
import { AuthScreen } from './components/AuthScreen';
import { DashboardView } from './components/DashboardView';
import { PersonsView } from './components/PersonsView';
import { DailyView } from './components/DailyView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { SearchView } from './components/SearchView';
import { SettingsView } from './components/SettingsView';
import { RecycleBinView } from './components/RecycleBinView';

// Modals
import { PersonFormModal } from './components/PersonFormModal';
import { IncomeFormModal } from './components/IncomeFormModal';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { PaymentFormModal } from './components/PaymentFormModal';
import { PersonProfileModal } from './components/PersonProfileModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { NotificationModal } from './components/NotificationModal';
import { PersonDeleteBlockedModal } from './components/PersonDeleteBlockedModal';
import { ToastContainer } from './components/ToastContainer';

const MainAppContent: React.FC = () => {
  const { user, isBiometricLocked, currentView } = useApp();

  return (
    <AndroidFrame>
      {!user || isBiometricLocked ? (
        <AuthScreen />
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black text-slate-800 dark:text-white relative transition-colors duration-200">
          {/* Dynamic Main View with smooth Page Open & Close Animations */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentView || 'dashboard'}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                className="flex-1 flex flex-col overflow-hidden relative w-full h-full"
              >
                {currentView === 'daily' && <DailyView />}
                {currentView === 'persons' && <PersonsView />}
                {currentView === 'payments' && <PaymentsView />}
                {currentView === 'reports' && <ReportsView />}
                {currentView === 'transactions' && <TransactionHistoryView />}
                {currentView === 'search' && <SearchView />}
                {currentView === 'settings' && <SettingsView />}
                {currentView === 'recycle_bin' && <RecycleBinView />}
                {(!currentView || currentView === 'dashboard' || !['daily', 'persons', 'payments', 'reports', 'transactions', 'search', 'settings', 'recycle_bin'].includes(currentView)) && <DashboardView />}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Quick Action Forms & Modals */}
          <PersonFormModal />
          <IncomeFormModal />
          <ExpenseFormModal />
          <PaymentFormModal />
          <PersonProfileModal />

          {/* System Dialogs & Feedback */}
          <ConfirmDialog />
          <NotificationModal />
          <PersonDeleteBlockedModal />
        </div>
      )}

      {/* Global Floating Toast Feedback */}
      <ToastContainer />
    </AndroidFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
