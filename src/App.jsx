import React, { useState, useEffect } from 'react';
import './App.css';

// Initial Pakistani Clients Demo Data
const DEFAULT_CLIENTS = [
  {
    id: 'c1',
    companyName: 'Al-Karam Textile Mills (Pvt) Ltd',
    ntn: '3819482-7',
    posId: '100495',
    city: 'Karachi',
    address: 'Plot 43, Sector 23, Korangi Industrial Area, Karachi',
    authKey: 'fbr_token_ak_99882233',
    isActive: true,
    salesTaxRate: 18 // Standard 18% Sales Tax in Pakistan
  },
  {
    id: 'c2',
    companyName: 'Chase Up Superstore',
    ntn: '4928103-4',
    posId: '201948',
    city: 'Lahore',
    address: 'Main Boulevard, Gulberg III, Lahore',
    authKey: 'fbr_token_cu_44221100',
    isActive: true,
    salesTaxRate: 15 // POS integrated retail tier-1 tax rate (15%)
  },
  {
    id: 'c3',
    companyName: 'Khyber Food Junction',
    ntn: '1092834-5',
    posId: '302485',
    city: 'Peshawar',
    address: 'University Road, Opposite Peshawar University, Peshawar',
    authKey: 'fbr_token_kf_77334411',
    isActive: true,
    salesTaxRate: 18 // Standard 18%
  }
];

const DEFAULT_PRODUCTS = {
  'c1': [
    { id: 'p1', name: 'Cotton Lawn Fabric (Premium)', price: 1850, unit: 'Meter' },
    { id: 'p2', name: 'Designer Ready-to-Wear Kurti', price: 4200, unit: 'Piece' },
    { id: 'p3', name: 'Embroidered Silk Shawl', price: 8500, unit: 'Piece' }
  ],
  'c2': [
    { id: 'p4', name: 'Basmati Rice Premium (5 Kg)', price: 2150, unit: 'Pack' },
    { id: 'p5', name: 'Canola Cooking Oil (5 Litre)', price: 3450, unit: 'Pack' },
    { id: 'p6', name: 'Pakistani Spices Gift Box', price: 950, unit: 'Box' }
  ],
  'c3': [
    { id: 'p7', name: 'Kabuli Pulao (Special Single)', price: 850, unit: 'Serving' },
    { id: 'p8', name: 'Mutton Karahi (Full KG)', price: 2800, unit: 'Serving' },
    { id: 'p9', name: 'Shinwari Tikka (1 Skewer)', price: 450, unit: 'Serving' }
  ]
};

const DEFAULT_CUSTOMERS = {
  'c1': [
    { id: 'cust1', name: 'Muhammad Rizwan', phone: '0300-1234567', ntn: '7766554-3' },
    { id: 'cust2', name: 'Zainab Bibi', phone: '0321-9876543', ntn: '' }
  ],
  'c2': [
    { id: 'cust3', name: 'Hamza Malik', phone: '0333-5554433', ntn: '2211443-8' },
    { id: 'cust4', name: 'Ayesha Khan', phone: '0312-8889990', ntn: '' }
  ],
  'c3': [
    { id: 'cust5', name: 'Sardar Ali Jan', phone: '0345-7771122', ntn: '' }
  ]
};

const DEFAULT_INVOICES = [
  {
    id: 'inv_101',
    clientId: 'c1',
    invoiceNumber: 'INV-2026-0001',
    customerName: 'Muhammad Rizwan',
    customerPhone: '0300-1234567',
    customerNtn: '7766554-3',
    date: '2026-07-10 14:30',
    items: [
      { name: 'Cotton Lawn Fabric (Premium)', price: 1850, quantity: 4, subtotal: 7400 }
    ],
    subtotal: 7400,
    salesTax: 1332, // 18%
    total: 8732,
    fbrStatus: 'SUCCESS',
    fbrFiscalNumber: 'FBR-c1-3819482-7-100495-20260710-143029',
    fbrUsin: '10049520260710143029'
  },
  {
    id: 'inv_102',
    clientId: 'c2',
    invoiceNumber: 'INV-2026-0002',
    customerName: 'Hamza Malik',
    customerPhone: '0333-5554433',
    customerNtn: '2211443-8',
    date: '2026-07-10 15:10',
    items: [
      { name: 'Basmati Rice Premium (5 Kg)', price: 2150, quantity: 2, subtotal: 4300 },
      { name: 'Canola Cooking Oil (5 Litre)', price: 3450, quantity: 1, subtotal: 3450 }
    ],
    subtotal: 7750,
    salesTax: 1162.5, // 15%
    total: 8912.5,
    fbrStatus: 'SUCCESS',
    fbrFiscalNumber: 'FBR-c2-4928103-4-201948-20260710-151044',
    fbrUsin: '20194820260710151044'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'admin'
  const [activeClient, setActiveClient] = useState(DEFAULT_CLIENTS[0]);
  
  // Database-like states backed by LocalStorage
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('fbr_clients');
    return saved ? JSON.parse(saved) : DEFAULT_CLIENTS;
  });
  
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('fbr_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });
  
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('fbr_customers');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
  });
  
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('fbr_invoices');
    return saved ? JSON.parse(saved) : DEFAULT_INVOICES;
  });

  const [fbrLogs, setFbrLogs] = useState(() => {
    const saved = localStorage.getItem('fbr_logs');
    return saved ? JSON.parse(saved) : [
      {
        time: '2026-07-10 15:10:44',
        type: 'SUCCESS',
        method: 'POST',
        url: 'https://api.fbr.gov.pk/ims/api/v1/SavePOSInvoice',
        payload: {
          InvoiceNumber: 'INV-2026-0002',
          POSID: '201948',
          USIN: '20194820260710151044',
          DateTime: '2026-07-10 15:10',
          BuyerNTN: '2211443-8',
          BuyerName: 'Hamza Malik',
          TotalQuantity: 3,
          TotalBill: 8912.5,
          TaxRate: 15,
          SalesTax: 1162.5
        },
        response: {
          ResponseCode: '100',
          ResponseMessage: 'Invoice Reported Successfully to FBR',
          FBRFiscalNumber: 'FBR-c2-4928103-4-201948-20260710-151044',
          USIN: '20194820260710151044'
        }
      }
    ];
  });

  // Global FBR Endpoint Config
  const [fbrEndpoint, setFbrEndpoint] = useState('https://api.fbr.gov.pk/ims/api/v1/SavePOSInvoice');
  const [fbrEnvironment, setFbrEnvironment] = useState('Sandbox / Testing');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('fbr_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('fbr_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fbr_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('fbr_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('fbr_logs', JSON.stringify(fbrLogs));
  }, [fbrLogs]);

  // Sync activeClient info when clients update
  useEffect(() => {
    const fresh = clients.find(c => c.id === activeClient.id);
    if (fresh) {
      setActiveClient(fresh);
    }
  }, [clients]);

  // Client Management Handlers
  const addClient = (clientData) => {
    const newId = 'c' + (clients.length + 1);
    const newClient = { ...clientData, id: newId, isActive: true };
    setClients([...clients, newClient]);
    setProducts({ ...products, [newId]: [] });
    setCustomers({ ...customers, [newId]: [] });
  };

  const updateClientStatus = (clientId, status) => {
    setClients(clients.map(c => c.id === clientId ? { ...c, isActive: status } : c));
  };

  // Product Management Handlers
  const addProduct = (clientId, product) => {
    const clientProds = products[clientId] || [];
    const newProduct = { ...product, id: 'p_' + Date.now() };
    setProducts({
      ...products,
      [clientId]: [...clientProds, newProduct]
    });
  };

  // Customer Management Handlers
  const addCustomer = (clientId, customer) => {
    const clientCusts = customers[clientId] || [];
    const newCustomer = { ...customer, id: 'cust_' + Date.now() };
    setCustomers({
      ...customers,
      [clientId]: [...clientCusts, newCustomer]
    });
  };

  // Invoice builder state variables
  const [selectedCust, setSelectedCust] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [currentProdId, setCurrentProdId] = useState('');
  const [currentQty, setCurrentQty] = useState(1);
  const [showPrintInvoice, setShowPrintInvoice] = useState(null);

  // FBR simulation call
  const handleFbrSync = (invoiceData) => {
    const timestampStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const usin = `${activeClient.posId}${timestampStr}`;
    const fbrFiscalNumber = `FBR-${activeClient.id}-${activeClient.ntn}-${activeClient.posId}-${new Date().toISOString().slice(0,10)}-${Date.now().toString().slice(-6)}`;
    
    const requestPayload = {
      InvoiceNumber: invoiceData.invoiceNumber,
      POSID: activeClient.posId,
      USIN: usin,
      DateTime: invoiceData.date,
      BuyerNTN: invoiceData.customerNtn || 'N/A',
      BuyerName: invoiceData.customerName,
      BuyerPhone: invoiceData.customerPhone || 'N/A',
      TotalQuantity: invoiceData.items.reduce((sum, item) => sum + item.quantity, 0),
      TotalBill: invoiceData.total,
      TaxRate: activeClient.salesTaxRate,
      SalesTax: invoiceData.salesTax,
      Items: invoiceData.items.map(item => ({
        ItemCode: item.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        ItemName: item.name,
        Quantity: item.quantity,
        TaxRate: activeClient.salesTaxRate,
        SalesTax: Math.round(item.price * item.quantity * (activeClient.salesTaxRate / 100))
      }))
    };

    const isSuccess = activeClient.isActive; // Simulate FBR API call failing if admin deactivated client POS
    
    const logTime = new Date().toLocaleString();
    const logEntry = {
      time: logTime,
      type: isSuccess ? 'SUCCESS' : 'ERROR',
      method: 'POST',
      url: fbrEndpoint,
      payload: requestPayload,
      response: isSuccess ? {
        ResponseCode: '100',
        ResponseMessage: 'Invoice Reported Successfully to FBR',
        FBRFiscalNumber: fbrFiscalNumber,
        USIN: usin,
        IntegrationStatus: 'Integrated & Verified'
      } : {
        ResponseCode: '401',
        ResponseMessage: 'Unauthorized POS ID. Connection rejected by FBR Gateway.',
        FBRFiscalNumber: null,
        USIN: null
      }
    };

    setFbrLogs(prev => [logEntry, ...prev]);

    return {
      success: isSuccess,
      fiscalNumber: isSuccess ? fbrFiscalNumber : null,
      usin: isSuccess ? usin : null
    };
  };

  const createInvoice = (e) => {
    e.preventDefault();
    if (!selectedCust) {
      alert('Please select a customer.');
      return;
    }
    if (invoiceItems.length === 0) {
      alert('Please add at least one product.');
      return;
    }

    const customerObj = (customers[activeClient.id] || []).find(c => c.id === selectedCust);
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);
    const salesTax = Math.round(subtotal * (activeClient.salesTaxRate / 100) * 100) / 100;
    const total = subtotal + salesTax;
    const invNumber = 'INV-' + new Date().getFullYear() + '-' + String(invoices.length + 1).padStart(4, '0');
    
    const tempInvoice = {
      id: 'inv_' + Date.now(),
      clientId: activeClient.id,
      invoiceNumber: invNumber,
      customerName: customerObj.name,
      customerPhone: customerObj.phone,
      customerNtn: customerObj.ntn,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      items: invoiceItems,
      subtotal,
      salesTax,
      total,
      fbrStatus: 'PENDING'
    };

    // Perform FBR API Call
    const syncRes = handleFbrSync(tempInvoice);

    const finalInvoice = {
      ...tempInvoice,
      fbrStatus: syncRes.success ? 'SUCCESS' : 'FAILED',
      fbrFiscalNumber: syncRes.fiscalNumber,
      fbrUsin: syncRes.usin
    };

    setInvoices(prev => [finalInvoice, ...prev]);
    setInvoiceItems([]);
    setSelectedCust('');
    setShowPrintInvoice(finalInvoice);
  };

  const addItemToInvoice = () => {
    if (!currentProdId) return;
    const prod = (products[activeClient.id] || []).find(p => p.id === currentProdId);
    if (!prod) return;
    
    // Check if item already exists in current list
    const existing = invoiceItems.find(i => i.name === prod.name);
    if (existing) {
      setInvoiceItems(invoiceItems.map(i => i.name === prod.name ? {
        ...i,
        quantity: i.quantity + Number(currentQty),
        subtotal: (i.quantity + Number(currentQty)) * i.price
      } : i));
    } else {
      setInvoiceItems([...invoiceItems, {
        name: prod.name,
        price: prod.price,
        quantity: Number(currentQty),
        subtotal: prod.price * Number(currentQty)
      }]);
    }
    setCurrentQty(1);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">F</div>
          <div>
            <h1 className="logo-text">FBR Sync Portal</h1>
            <span style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              PAKISTAN FISCAL GATEWAY
            </span>
          </div>
        </div>

        <div className="nav-controls">
          <div className="tab-group">
            <button 
              className={`tab-btn ${activeTab === 'client' ? 'active' : ''}`}
              onClick={() => { setActiveTab('client'); setShowPrintInvoice(null); }}
            >
              💼 Client Terminal
            </button>
            <button 
              className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => { setActiveTab('admin'); setShowPrintInvoice(null); }}
            >
              🔑 Admin Panel
            </button>
          </div>
        </div>
      </header>

      {/* Main View Grid */}
      <main style={{ flex: 1 }}>
        {/* Banner to switch the Active Client Client for Demo ease */}
        {activeTab === 'client' && (
          <div className="client-select-banner">
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>⚡ Demo Invoicing Terminal</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Select which client invoice screen you want to interact with:
              </p>
            </div>
            <select 
              className="client-dropdown"
              value={activeClient.id}
              onChange={(e) => {
                const selected = clients.find(c => c.id === e.target.value);
                if (selected) {
                  setActiveClient(selected);
                  setInvoiceItems([]);
                  setSelectedCust('');
                  setShowPrintInvoice(null);
                }
              }}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.companyName} ({c.city})</option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'client' && !showPrintInvoice && (
          <div className="dashboard-grid">
            {/* Left side: Terminal Invoice builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <div className="card-title">
                  <span>Create Invoice</span>
                  <span className="badge badge-info">POS ID: {activeClient.posId}</span>
                </div>

                <form onSubmit={createInvoice}>
                  <div className="form-row">
                    {/* Customer Selection */}
                    <div className="form-group">
                      <label>1. Customer Detail</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          className="form-control"
                          value={selectedCust}
                          onChange={(e) => setSelectedCust(e.target.value)}
                        >
                          <option value="">-- Choose Customer --</option>
                          {(customers[activeClient.id] || []).map(cust => (
                            <option key={cust.id} value={cust.id}>
                              {cust.name} {cust.phone ? `(${cust.phone})` : ''}
                            </option>
                          ))}
                        </select>
                        <QuickAddCustomer 
                          clientId={activeClient.id} 
                          onAdd={(cust) => addCustomer(activeClient.id, cust)} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add Product Items */}
                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px' }}>
                    <label>2. Add Product Items</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Select Product</span>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <select
                            className="form-control"
                            value={currentProdId}
                            onChange={(e) => setCurrentProdId(e.target.value)}
                          >
                            <option value="">-- Choose Product --</option>
                            {(products[activeClient.id] || []).map(prod => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name} (Rs. {prod.price} per {prod.unit})
                              </option>
                            ))}
                          </select>
                          <QuickAddProduct 
                            clientId={activeClient.id}
                            onAdd={(prod) => addProduct(activeClient.id, prod)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Qty</span>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          style={{ marginTop: '4px' }}
                          value={currentQty}
                          onChange={(e) => setCurrentQty(e.target.value)}
                        />
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={addItemToInvoice}
                        disabled={!currentProdId}
                      >
                        ➕ Add
                      </button>
                    </div>
                  </div>

                  {/* Invoice Summary Table */}
                  {invoiceItems.length > 0 && (
                    <div style={{ margin: '20px 0' }}>
                      <table style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceItems.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.name}</td>
                              <td>Rs. {item.price}</td>
                              <td>{item.quantity}</td>
                              <td>Rs. {item.subtotal}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))}
                                >
                                  ❌ Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pricing and Submit row */}
                  {invoiceItems.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginTop: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'flex-end', width: '250px', marginLeft: 'auto', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                          <span>Rs. {invoiceItems.reduce((s, i) => s + i.subtotal, 0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Sales Tax ({activeClient.salesTaxRate}%):</span>
                          <span>Rs. {(invoiceItems.reduce((s, i) => s + i.subtotal, 0) * (activeClient.salesTaxRate / 100)).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontWeight: 'bold' }}>
                          <span>Net Bill:</span>
                          <span style={{ color: 'var(--primary)' }}>
                            Rs. {(invoiceItems.reduce((s, i) => s + i.subtotal, 0) * (1 + activeClient.salesTaxRate / 100)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                          type="submit"
                          className="btn btn-primary"
                        >
                          ⚡ Generate & FBR Sync
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Invoices History list */}
              <div className="card">
                <div className="card-title">Invoices History ({activeClient.companyName})</div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>FBR Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.filter(inv => inv.clientId === activeClient.id).map(inv => (
                        <tr key={inv.id}>
                          <td>{inv.invoiceNumber}</td>
                          <td>{inv.customerName}</td>
                          <td>{inv.date}</td>
                          <td>Rs. {inv.total}</td>
                          <td>
                            <span className={`badge ${inv.fbrStatus === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>
                              {inv.fbrStatus}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setShowPrintInvoice(inv)}
                            >
                              📄 Print Fiscal Copy
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right side: FBR Debug Gateway Output */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <div className="card-title">FBR Fiscal Integration Log Console</div>
                <div style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>Gateway Endpoint:</strong> <code style={{ fontSize: '11px', color: 'var(--primary)' }}>{fbrEndpoint}</code>
                </div>
                <div className="logs-console">
                  {fbrLogs.map((log, idx) => (
                    <div key={idx} className={`log-entry ${log.type === 'SUCCESS' ? 'success' : 'error'}`}>
                      <span className="log-time">[{log.time}]</span>
                      <strong>{log.method} {log.type}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0' }}>
                        Payload sent to FBR gateway:
                      </div>
                      <div className="json-block">{JSON.stringify(log.payload, null, 2)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0' }}>
                        FBR API Gateway Response:
                      </div>
                      <div className="json-block">{JSON.stringify(log.response, null, 2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Print Invoice view screen */}
        {activeTab === 'client' && showPrintInvoice && (
          <div style={{ maxWidth: '600px', margin: '0 auto 40px auto' }}>
            <div style={{ marginBottom: '16px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPrintInvoice(null)}>
                ⬅️ Back to Invoice Builder
              </button>
            </div>
            
            <div className="invoice-paper">
              {/* Receipt Top Header */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {clients.find(c => c.id === showPrintInvoice.clientId)?.companyName || 'Retail Outlet'}
                </h2>
                <p style={{ color: '#475569', fontSize: '12px' }}>
                  {clients.find(c => c.id === showPrintInvoice.clientId)?.address || 'Pakistan'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px', fontSize: '12px', borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
                  <span><strong>NTN:</strong> {clients.find(c => c.id === showPrintInvoice.clientId)?.ntn}</span>
                  <span><strong>POS ID:</strong> {clients.find(c => c.id === showPrintInvoice.clientId)?.posId}</span>
                </div>
              </div>

              {/* Invoice Meta info */}
              <div className="invoice-header-grid" style={{ fontSize: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <div>
                  <p><strong>Invoice Number:</strong> {showPrintInvoice.invoiceNumber}</p>
                  <p><strong>Date & Time:</strong> {showPrintInvoice.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p><strong>Customer:</strong> {showPrintInvoice.customerName}</p>
                  <p><strong>Phone:</strong> {showPrintInvoice.customerPhone || 'N/A'}</p>
                  {showPrintInvoice.customerNtn && <p><strong>Buyer NTN:</strong> {showPrintInvoice.customerNtn}</p>}
                </div>
              </div>

              {/* Items Table */}
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {showPrintInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'right' }}>Rs. {item.price}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>Rs. {item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '220px', marginLeft: 'auto', marginBottom: '24px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>Rs. {showPrintInvoice.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sales Tax ({clients.find(c => c.id === showPrintInvoice.clientId)?.salesTaxRate}%):</span>
                  <span>Rs. {showPrintInvoice.salesTax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                  <span>Total Amount:</span>
                  <span>Rs. {showPrintInvoice.total}</span>
                </div>
              </div>

              {/* FBR Fiscal Stamp Section */}
              <div className="fbr-fiscal-details">
                <div style={{ fontSize: '11px', flex: 1, paddingRight: '12px' }}>
                  <h4 style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                    🛡️ FBR FISCAL RECEIPT <span className="urdu-text">(فیسکل رسید)</span>
                  </h4>
                  {showPrintInvoice.fbrFiscalNumber ? (
                    <>
                      <p style={{ marginTop: '6px', color: '#334155' }}>
                        <strong>FBR Invoice # :</strong><br/>
                        <code style={{ fontSize: '10px', background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>{showPrintInvoice.fbrFiscalNumber}</code>
                      </p>
                      <p style={{ color: '#334155', marginTop: '4px' }}>
                        <strong>USIN:</strong> {showPrintInvoice.fbrUsin}
                      </p>
                    </>
                  ) : (
                    <p style={{ color: 'red', marginTop: '6px' }}>
                      ⚠️ OFFLINE MODE: Not reported to FBR. Check terminal connection logs.
                    </p>
                  )}
                </div>

                <div className="fbr-qr-code">
                  {showPrintInvoice.fbrFiscalNumber ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://fbr.gov.pk/verify-invoice?fbrno=${showPrintInvoice.fbrFiscalNumber}`} 
                      alt="FBR Verification QR Code" 
                      style={{ width: '80px', height: '80px' }}
                    />
                  ) : (
                    <span style={{ fontSize: '10px', color: '#ef4444' }}>OFFLINE</span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '10px', color: '#64748b' }}>
                Thank you for shopping with us!<br/>
                Verified FBR POS Invoicing Software. Developed by FBR Sync Ltd.
              </div>
            </div>
          </div>
        )}

        {/* Admin Dashboard view */}
        {activeTab === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Top metrics row */}
            <div className="metrics-row">
              <div className="metric-card">
                <div className="metric-label">Registered Clients</div>
                <div className="metric-value">{clients.length}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Total Sync Invoices</div>
                <div className="metric-value">
                  {invoices.filter(i => i.fbrStatus === 'SUCCESS').length}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Total Sales Tax Integrated</div>
                <div className="metric-value">
                  Rs. {invoices.filter(i => i.fbrStatus === 'SUCCESS').reduce((sum, i) => sum + i.salesTax, 0).toLocaleString()}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Active POS Machines</div>
                <div className="metric-value">
                  {clients.filter(c => c.isActive).length} / {clients.length}
                </div>
              </div>
            </div>

            {/* Clients Management */}
            <div className="card">
              <div className="card-title">
                <span>Manage Clients POS Licenses</span>
                <QuickAddClient onAdd={addClient} />
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>NTN</th>
                      <th>FBR POS ID</th>
                      <th>Branch City</th>
                      <th>Tax Model</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.id}>
                        <td><strong>{client.companyName}</strong></td>
                        <td>{client.ntn}</td>
                        <td><code>{client.posId}</code></td>
                        <td>{client.city}</td>
                        <td>{client.salesTaxRate}% Sales Tax</td>
                        <td>
                          <span className={`badge ${client.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {client.isActive ? 'Active Integration' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          {client.isActive ? (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => updateClientStatus(client.id, false)}
                            >
                              Deactivate POS
                            </button>
                          ) : (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => updateClientStatus(client.id, true)}
                            >
                              Activate POS
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FBR Gateway Configuration Panel */}
            <div className="card">
              <div className="card-title">FBR Global Web API Gateway Config</div>
              <div className="form-row">
                <div className="form-group">
                  <label>FBR Production/Sandbox Endpoint URL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fbrEndpoint}
                    onChange={(e) => setFbrEndpoint(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Environment State</label>
                  <select
                    className="form-control"
                    value={fbrEnvironment}
                    onChange={(e) => setFbrEnvironment(e.target.value)}
                  >
                    <option value="Sandbox / Testing">Sandbox / Testing (FBR IMS API v1)</option>
                    <option value="Live / Production">Live / Production (Real-time fiscal audit)</option>
                  </select>
                </div>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                💡 <strong>Important Note:</strong> Each POS machine must register its POS ID directly on the FBR portal to get authorization headers. Keep the FBR Endpoint to testing URLs during client onboarding.
              </div>
            </div>

            {/* All Invoices Master Ledger */}
            <div className="card">
              <div className="card-title">System-Wide FBR Ledger</div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Merchant</th>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Total Amount</th>
                      <th>Tax Amount</th>
                      <th>FBR Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id}>
                        <td><strong>{clients.find(c => c.id === inv.clientId)?.companyName}</strong></td>
                        <td>{inv.invoiceNumber}</td>
                        <td>{inv.date}</td>
                        <td>Rs. {inv.total}</td>
                        <td>Rs. {inv.salesTax}</td>
                        <td>
                          <span className={`badge ${inv.fbrStatus === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>
                            {inv.fbrStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

// Modal Form: Add Customer
function QuickAddCustomer({ clientId, onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ntn, setNtn] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAdd({ name, phone, ntn });
    setName('');
    setPhone('');
    setNtn('');
    setIsOpen(false);
  };

  return (
    <>
      <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        ➕ New
      </button>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '16px' }}>Add Customer</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input type="text" className="form-control" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" className="form-control" placeholder="03xx-xxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Customer NTN / CNIC</label>
                <input type="text" className="form-control" placeholder="Optional" value={ntn} onChange={e => setNtn(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Modal Form: Add Product
function QuickAddProduct({ clientId, onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Piece');

  const submit = (e) => {
    e.preventDefault();
    if (!name || !price) return;
    onAdd({ name, price: Number(price), unit });
    setName('');
    setPrice('');
    setUnit('Piece');
    setIsOpen(false);
  };

  return (
    <>
      <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        ➕ New
      </button>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '16px' }}>Add Product</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input type="text" className="form-control" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Unit Price (Rs.) *</label>
                  <input type="number" className="form-control" required value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Selling Unit</label>
                  <select className="form-control" value={unit} onChange={e => setUnit(e.target.value)}>
                    <option value="Piece">Piece</option>
                    <option value="Meter">Meter</option>
                    <option value="Pack">Pack</option>
                    <option value="Box">Box</option>
                    <option value="Serving">Serving</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Modal Form: Add Client
function QuickAddClient({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [ntn, setNtn] = useState('');
  const [posId, setPosId] = useState('');
  const [city, setCity] = useState('Karachi');
  const [address, setAddress] = useState('');
  const [taxRate, setTaxRate] = useState(18);

  const submit = (e) => {
    e.preventDefault();
    if (!companyName || !ntn || !posId) return;
    onAdd({
      companyName,
      ntn,
      posId,
      city,
      address,
      salesTaxRate: Number(taxRate)
    });
    setCompanyName('');
    setNtn('');
    setPosId('');
    setAddress('');
    setIsOpen(false);
  };

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsOpen(true)}>
        ➕ Register Client POS License
      </button>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px' }}>
            <h3 style={{ marginBottom: '16px' }}>Register POS License</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Company Name *</label>
                <input type="text" className="form-control" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>NTN Number (e.g. xxxxxxx-x) *</label>
                  <input type="text" className="form-control" required placeholder="1234567-8" value={ntn} onChange={e => setNtn(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>FBR Integrated POS ID *</label>
                  <input type="text" className="form-control" required placeholder="6-digit ID" value={posId} onChange={e => setPosId(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <select className="form-control" value={city} onChange={e => setCity(e.target.value)}>
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Faisalabad">Faisalabad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sales Tax Rate (%)</label>
                  <select className="form-control" value={taxRate} onChange={e => setTaxRate(e.target.value)}>
                    <option value="18">18% (Standard Services/Goods)</option>
                    <option value="15">15% (Tier-1 Retail POS)</option>
                    <option value="0">0% (Zero-Rated Exports)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Physical Address</label>
                <input type="text" className="form-control" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Onboard Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
