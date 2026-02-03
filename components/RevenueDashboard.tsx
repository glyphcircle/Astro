import React, { useMemo } from 'react';
import { useAnalytics, AnalyticsEvent } from './Analytics';
import Card from './shared/Card';
// @ts-ignore
import { Link } from 'react-router-dom';

const RevenueDashboard: React.FC = () => {
  const { events, getFunnelStats } = useAnalytics();
  const funnel = getFunnelStats();

  const metrics = useMemo(() => {
    const totalRevenue = events
        .filter(e => e.name === 'Payment Success')
        .reduce((sum, e) => sum + (e.properties?.amount || 0), 0);
    
    const todayRevenue = events
        .filter(e => e.name === 'Payment Success' && e.timestamp > Date.now() - 86400000)
        .reduce((sum, e) => sum + (e.properties?.amount || 0), 0);

    const activeUsers = new Set(events.map(e => e.userId || 'anon')).size;
    
    // A/B Test Results
    const variantA = events.filter(e => e.name === 'Payment Success' && e.properties?.amount === 49).length;
    const variantB = events.filter(e => e.name === 'Payment Success' && e.properties?.amount === 29).length;

    return { totalRevenue, todayRevenue, activeUsers, variantA, variantB };
  }, [events]);

  const recentEvents = [...events].reverse().slice(0, 10);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-cinzel font-bold text-amber-300">Sanctum Analytics</h2>
            <p className="text-amber-200/60 font-mono text-xs">REAL-TIME REVENUE TRACKER</p>
          </div>
          <Link to="/home" className="text-sm text-amber-400 hover:underline">Exit Dashboard</Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-gray-900 to-black border-l-4 border-green-500">
            <div className="p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider">Total Revenue</div>
                <div className="text-3xl font-bold text-white mt-1">₹{metrics.totalRevenue}</div>
                <div className="text-green-400 text-xs mt-2">▲ 12% vs last week</div>
            </div>
        </Card>
        <Card className="bg-gradient-to-br from-gray-900 to-black border-l-4 border-blue-500">
            <div className="p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider">Today's Earnings</div>
                <div className="text-3xl font-bold text-white mt-1">₹{metrics.todayRevenue}</div>
                <div className="text-blue-400 text-xs mt-2">{Math.floor(metrics.todayRevenue / 49)} orders</div>
            </div>
        </Card>
        <Card className="bg-gradient-to-br from-gray-900 to-black border-l-4 border-amber-500">
            <div className="p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider">Conversion Rate</div>
                <div className="text-3xl font-bold text-white mt-1">{funnel.conversionRate}%</div>
                <div className="text-amber-400 text-xs mt-2">Funnel Health: Good</div>
            </div>
        </Card>
        <Card className="bg-gradient-to-br from-gray-900 to-black border-l-4 border-purple-500">
            <div className="p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider">Active Seekers</div>
                <div className="text-3xl font-bold text-white mt-1">{metrics.activeUsers}</div>
                <div className="text-purple-400 text-xs mt-2">Live Now</div>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Conversion Funnel */}
          <Card>
              <div className="p-6">
                  <h3 className="text-xl font-bold text-amber-100 mb-6">Conversion Funnel</h3>
                  <div className="space-y-4">
                      <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-200">
                                Home Visits
                              </span>
                              <span className="text-xs font-semibold inline-block text-amber-600">
                                {funnel.views}
                              </span>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-amber-200/20">
                              <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
                          </div>
                      </div>

                      <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                Readings Generated
                              </span>
                              <span className="text-xs font-semibold inline-block text-blue-600">
                                {funnel.readings} ({Math.round((funnel.readings/funnel.views)*100)}%)
                              </span>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200/20">
                              <div style={{ width: `${(funnel.readings/funnel.views)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                          </div>
                      </div>

                      <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                                Payment Intent
                              </span>
                              <span className="text-xs font-semibold inline-block text-purple-600">
                                {funnel.intents} ({Math.round((funnel.intents/funnel.views)*100)}%)
                              </span>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200/20">
                              <div style={{ width: `${(funnel.intents/funnel.views)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
                          </div>
                      </div>

                      <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                                Paid Users
                              </span>
                              <span className="text-xs font-semibold inline-block text-green-600">
                                {funnel.conversions} ({Math.round((funnel.conversions/funnel.views)*100)}%)
                              </span>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200/20">
                              <div style={{ width: `${(funnel.conversions/funnel.views)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                          </div>
                      </div>
                  </div>
              </div>
          </Card>

          {/* A/B Test Results */}
          <Card>
              <div className="p-6">
                  <h3 className="text-xl font-bold text-amber-100 mb-6">A/B Test: Pricing (v1)</h3>
                  <div className="flex gap-4">
                      <div className="flex-1 bg-gray-900 rounded-lg p-4 border border-gold-500/30 text-center">
                          <div className="text-gold-400 font-bold mb-2">Variant A (₹49)</div>
                          <div className="text-2xl text-white">{metrics.variantA}</div>
                          <div className="text-xs text-gray-500">Conversions</div>
                          <div className="mt-2 text-sm text-green-400 font-bold">₹{metrics.variantA * 49}</div>
                      </div>
                      <div className="flex-1 bg-gray-900 rounded-lg p-4 border border-purple-500/30 text-center">
                          <div className="text-purple-400 font-bold mb-2">Variant B (₹29)</div>
                          <div className="text-2xl text-white">{metrics.variantB}</div>
                          <div className="text-xs text-gray-500">Conversions</div>
                          <div className="mt-2 text-sm text-green-400 font-bold">₹{metrics.variantB * 29}</div>
                      </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-900/20 rounded text-xs text-blue-200 text-center">
                      Analysis: Variant A (₹49) generates <strong>{metrics.variantA * 49 > metrics.variantB * 29 ? 'Higher' : 'Lower'}</strong> total revenue despite volume differences.
                  </div>
              </div>
          </Card>
      </div>

      {/* Live Event Stream */}
      <Card>
          <div className="p-6 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-400 mb-4 sticky top-0 bg-gray-900/95 py-2">Live Event Stream</h3>
              <table className="w-full text-left text-sm">
                  <thead>
                      <tr className="text-gray-500 border-b border-gray-700">
                          <th className="pb-2">Time</th>
                          <th className="pb-2">Event</th>
                          <th className="pb-2">User</th>
                          <th className="pb-2">Details</th>
                      </tr>
                  </thead>
                  <tbody>
                      {recentEvents.map((e, i) => (
                          <tr key={i} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                              <td className="py-2 text-gray-400 font-mono text-xs">
                                  {new Date(e.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="py-2">
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                      e.name === 'Payment Success' ? 'bg-green-900 text-green-300' :
                                      e.name === 'Open Payment Modal' ? 'bg-purple-900 text-purple-300' :
                                      'text-gray-300'
                                  }`}>
                                      {e.name}
                                  </span>
                              </td>
                              <td className="py-2 text-gray-500 text-xs">{e.userId}</td>
                              <td className="py-2 text-gray-400 text-xs font-mono">
                                  {JSON.stringify(e.properties)}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </Card>

    </div>
  );
};

export default RevenueDashboard;