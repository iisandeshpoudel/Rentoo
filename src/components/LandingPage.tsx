import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 via-primary-50 to-white">
      <div className="content-container pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block bg-gradient-premium bg-clip-text text-transparent">Rental Marketplace</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            The perfect platform to rent and list items. Join our community to start renting or earning from your items.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/register"
              className="btn-primary"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="btn-secondary"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="card-premium p-6 text-center transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-premium text-white mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Rent Items</h3>
              <p className="mt-2 text-base text-gray-600">
                Find and rent the items you need from our trusted community of lenders.
              </p>
            </div>

            <div className="card-gold p-6 text-center transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-gold text-white mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Earn Money</h3>
              <p className="mt-2 text-base text-gray-600">
                List your items and start earning money from items you don't use every day.
              </p>
            </div>

            <div className="card-premium p-6 text-center transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-premium text-white mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Secure & Safe</h3>
              <p className="mt-2 text-base text-gray-600">
                Our platform ensures secure transactions and verified users for peace of mind.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 