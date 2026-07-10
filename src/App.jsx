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
    username: 'alkaram',
    password: 'alkaram123',
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
    username: 'chaseup',
    password: 'chaseup123',
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
    username: 'khyber',
    password: 'khyber123',
    isActive: true,
    salesTaxRate: 18 // Standard 18%
  }
];

const DEFAULT_PRODUCTS = {
  'c1': [
    { id: 'p1', name: 'Cotton Lawn Fabric (Premium)', price: 1850, unit: 'Meter', stock: 450, hsCode: '5208.3100' },
    { id: 'p2', name: 'Designer Ready-to-Wear Kurti', price: 4200, unit: 'Piece', stock: 120, hsCode: '6204.4200' },
    { id: 'p3', name: 'Embroidered Silk Shawl', price: 8500, unit: 'Piece', stock: 6, hsCode: '6214.1000' }
  ],
  'c2': [
    { id: 'p4', name: 'Basmati Rice Premium (5 Kg)', price: 2150, unit: 'Pack', stock: 300, hsCode: '1006.3010' },
    { id: 'p5', name: 'Canola Cooking Oil (5 Litre)', price: 3450, unit: 'Pack', stock: 150, hsCode: '1514.1900' },
    { id: 'p6', name: 'Pakistani Spices Gift Box', price: 950, unit: 'Box', stock: 80, hsCode: '0910.9100' }
  ],
  'c3': [
    { id: 'p7', name: 'Kabuli Pulao (Special Single)', price: 850, unit: 'Serving', stock: 200, hsCode: '2106.9090' },
    { id: 'p8', name: 'Mutton Karahi (Full KG)', price: 2800, unit: 'Serving', stock: 50, hsCode: '2106.9090' },
    { id: 'p9', name: 'Shinwari Tikka (1 Skewer)', price: 450, unit: 'Serving', stock: 180, hsCode: '2106.9090' }
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
    salesTax: 1332,
    fbrFee: 1.00,
    total: 8733,
    fbrStatus: 'SUCCESS',
    fbrFiscalNumber: 'FBR-c1-3819482-7-100495-20260710-143029',
    fbrUsin: '10049520260710143029',
    paymentMethod: 'Cash'
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
    salesTax: 1162.5,
    fbrFee: 1.00,
    total: 8913.5,
    fbrStatus: 'SUCCESS',
    fbrFiscalNumber: 'FBR-c2-4928103-4-201948-20260710-151044',
    fbrUsin: '20194820260710151044',
    paymentMethod: 'Card'
  }
];

export default function App() {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('fbr_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Database-like states backed by LocalStorage, with dynamic upgrade logic
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('fbr_clients');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0 && !parsed[0].username) {
        localStorage.removeItem('fbr_clients');
        return DEFAULT_CLIENTS;
      }
      return parsed;
    }
    return DEFAULT_CLIENTS;
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
    return saved ? JSON.parse(saved) : [];
  });

  // Client view navigation state
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [activeClient, setActiveClient] = useState(DEFAULT_CLIENTS[0]);

  // FBR Connection Mode: Online or Offline
  const [fbrConnectionMode, setFbrConnectionMode] = useState('online');

  // Ledger Filter states
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerFilterStatus, setLedgerFilterStatus] = useState('ALL');

  // Global FBR settings
  const [fbrEndpoint, setFbrEndpoint] = useState('https://api.fbr.gov.pk/ims/api/v1/SavePOSInvoice');
  const [fbrEnvironment, setFbrEnvironment] = useState('Sandbox / Testing');

  // Clear all schemas if user request forces a hard reset
  const handleForceClearCache = () => {
    localStorage.clear();
    setClients(DEFAULT_CLIENTS);
    setProducts(DEFAULT_PRODUCTS);
    setCustomers(DEFAULT_CUSTOMERS);
    setInvoices(DEFAULT_INVOICES);
    setFbrLogs([]);
    setCurrentUser(null);
    window.location.reload();
  };

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

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fbr_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fbr_current_user');
    }
  }, [currentUser]);

  // Synchronize state based on user role login
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setActiveSidebarTab('admin_panel');
        setActiveClient(clients[0] || DEFAULT_CLIENTS[0]);
      } else {
        setActiveSidebarTab('dashboard');
        const matched = clients.find(c => c.id === currentUser.clientId);
        if (matched) {
          setActiveClient(matched);
        } else {
          setActiveClient(clients[0] || DEFAULT_CLIENTS[0]);
        }
      }
    }
  }, [currentUser, clients]);

  // Authenticate user
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
      setCurrentUser({ role: 'admin', name: 'System Administrator' });
      return;
    }

    const matchedClient = clients.find(
      c => c.username === loginUsername && c.password === loginPassword
    );

    if (matchedClient) {
      setCurrentUser({
        role: 'client',
        clientId: matchedClient.id,
        name: matchedClient.companyName
      });
    } else {
      setLoginError('Invalid credentials. Double check login hints.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
    setShowPrintInvoice(null);
  };

  // Client Onboarding Handlers
  const addClient = (clientData) => {
    const newId = 'c' + (clients.length + 1);
    const userAlias = clientData.companyName.split(' ')[0].toLowerCase();
    const newClient = { 
      ...clientData, 
      id: newId, 
      isActive: true,
      username: userAlias,
      password: userAlias + '123'
    };
    setClients([...clients, newClient]);
    setProducts({ ...products, [newId]: [] });
    setCustomers({ ...customers, [newId]: [] });
  };

  const updateClientStatus = (clientId, status) => {
    setClients(clients.map(c => c.id === clientId ? { ...c, isActive: status } : c));
  };

  // Product Catalog Inventory Handlers
  const addProduct = (clientId, product) => {
    const clientProds = products[clientId] || [];
    const newProduct = { 
      ...product, 
      id: 'p_' + Date.now(),
      stock: Number(product.stock) || 100 
    };
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

  // POS Checkout Cartesian state
  const [selectedCust, setSelectedCust] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showPrintInvoice, setShowPrintInvoice] = useState(null);

  const addToCart = (product) => {
    const existing = cartItems.find(item => item.id === product.id);
    const activeQty = existing ? existing.qty : 0;
    
    if (activeQty >= product.stock) {
      alert(`Out of stock! Only ${product.stock} units available.`);
      return;
    }

    if (existing) {
      setCartItems(cartItems.map(item => item.id === product.id ? {
        ...item,
        qty: item.qty + 1,
        subtotal: (item.qty + 1) * item.price
      } : item));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        subtotal: product.price
      }]);
    }
  };

  const updateCartQty = (prodId, delta) => {
    const matched = cartItems.find(item => item.id === prodId);
    if (!matched) return;

    if (delta > 0) {
      const dbProd = (products[activeClient?.id || ''] || []).find(p => p.id === prodId);
      if (dbProd && matched.qty >= dbProd.stock) {
        alert(`Out of stock limit! Maximum ${dbProd.stock} units allowed.`);
        return;
      }
    }
    
    const newQty = matched.qty + delta;
    if (newQty <= 0) {
      setCartItems(cartItems.filter(item => item.id !== prodId));
    } else {
      setCartItems(cartItems.map(item => item.id === prodId ? {
        ...item,
        qty: newQty,
        subtotal: newQty * item.price
      } : item));
    }
  };

  // FBR simulation logic
  const handleFbrSync = (invoiceData, isForcedOnline = false) => {
    const isOnline = isForcedOnline || (fbrConnectionMode === 'online');
    
    const timestampStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const usin = `${activeClient?.posId || '000000'}${timestampStr}`;
    const fbrFiscalNumber = `FBR-${activeClient?.id || 'c0'}-${activeClient?.ntn || '0000000-0'}-${activeClient?.posId || '000000'}-${new Date().toISOString().slice(0,10)}-${Date.now().toString().slice(-6)}`;
    
    const requestPayload = {
      InvoiceNumber: invoiceData.invoiceNumber,
      POSID: activeClient?.posId || '000000',
      USIN: usin,
      DateTime: invoiceData.date,
      BuyerNTN: invoiceData.customerNtn || 'N/A',
      BuyerName: invoiceData.customerName,
      BuyerPhone: invoiceData.customerPhone || 'N/A',
      TotalQuantity: invoiceData.items.reduce((sum, item) => sum + item.quantity, 0),
      TotalBill: invoiceData.total,
      TaxRate: activeClient?.salesTaxRate || 18,
      SalesTax: invoiceData.salesTax,
      POSServiceFee: 1.00,
      Items: invoiceData.items.map(item => ({
        ItemCode: item.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        ItemName: item.name,
        Quantity: item.quantity,
        TaxRate: activeClient?.salesTaxRate || 18,
        SalesTax: Math.round(item.price * item.quantity * ((activeClient?.salesTaxRate || 18) / 100))
      }))
    };

    const isSuccess = activeClient?.isActive && isOnline;
    
    const logTime = new Date().toLocaleString();
    const logEntry = {
      time: logTime,
      type: isSuccess ? 'SUCCESS' : (isOnline ? 'ERROR' : 'OFFLINE_QUEUED'),
      method: 'POST',
      url: fbrEndpoint,
      payload: requestPayload,
      response: isSuccess ? {
        ResponseCode: '100',
        ResponseMessage: 'Invoice Reported Successfully to FBR',
        FBRFiscalNumber: fbrFiscalNumber,
        USIN: usin,
        IntegrationStatus: 'Integrated & Verified'
      } : (!isOnline ? {
        ResponseCode: '202',
        ResponseMessage: 'Offline mode active. Invoice saved to local queue.'
      } : {
        ResponseCode: '401',
        ResponseMessage: 'Unauthorized POS ID. Connection rejected by FBR Gateway.',
        FBRFiscalNumber: null,
        USIN: null
      })
    };

    setFbrLogs(prev => [logEntry, ...prev]);

    return {
      success: isSuccess,
      isOffline: !isOnline,
      fiscalNumber: isSuccess ? fbrFiscalNumber : null,
      usin: isSuccess ? usin : null
    };
  };

  const processCartInvoicing = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Cart is empty.');
      return;
    }

    let custName = 'Walk-In Customer';
    let custPhone = 'N/A';
    let custNtn = '';

    if (selectedCust) {
      const match = (customers[activeClient?.id || ''] || []).find(c => c.id === selectedCust);
      if (match) {
        custName = match.name;
        custPhone = match.phone;
        custNtn = match.ntn;
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const salesTax = Math.round(subtotal * ((activeClient?.salesTaxRate || 18) / 100) * 100) / 100;
    const fbrFee = 1.00; // Mandatory Rs. 1 POS fee
    const total = subtotal + salesTax + fbrFee;
    const invNumber = 'INV-' + new Date().getFullYear() + '-' + String(invoices.length + 1).padStart(4, '0');

    const tempInvoice = {
      id: 'inv_' + Date.now(),
      clientId: activeClient?.id || 'c1',
      invoiceNumber: invNumber,
      customerName: custName,
      customerPhone: custPhone,
      customerNtn: custNtn,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      items: cartItems.map(i => ({ name: i.name, price: i.price, quantity: i.qty, subtotal: i.subtotal })),
      subtotal,
      salesTax,
      fbrFee,
      total,
      paymentMethod,
      fbrStatus: 'PENDING'
    };

    // Deduct stock levels in local store database
    const storeProds = products[activeClient?.id || ''] || [];
    const updatedProds = storeProds.map(p => {
      const cartMatch = cartItems.find(c => c.id === p.id);
      if (cartMatch) {
        return { ...p, stock: Math.max(0, p.stock - cartMatch.qty) };
      }
      return p;
    });
    setProducts({ ...products, [activeClient?.id || '']: updatedProds });

    // FBR Sync
    const syncRes = handleFbrSync(tempInvoice);

    const finalInvoice = {
      ...tempInvoice,
      fbrStatus: syncRes.success ? 'SUCCESS' : (syncRes.isOffline ? 'OFFLINE_PENDING' : 'FAILED'),
      fbrFiscalNumber: syncRes.fiscalNumber,
      fbrUsin: syncRes.usin
    };

    setInvoices(prev => [finalInvoice, ...prev]);
    setCartItems([]);
    setSelectedCust('');
    setShowPrintInvoice(finalInvoice);
  };

  // Sync Offline Queue handler
  const handleBulkSyncOfflineQueue = () => {
    const offlineInvoices = invoices.filter(
      i => i.clientId === activeClient?.id && i.fbrStatus === 'OFFLINE_PENDING'
    );

    if (offlineInvoices.length === 0) {
      alert('No offline invoices to sync.');
      return;
    }

    const updatedInvoices = invoices.map(inv => {
      if (inv.clientId === activeClient?.id && inv.fbrStatus === 'OFFLINE_PENDING') {
        const syncRes = handleFbrSync(inv, true); // force online posting
        return {
          ...inv,
          fbrStatus: syncRes.success ? 'SUCCESS' : 'FAILED',
          fbrFiscalNumber: syncRes.fiscalNumber,
          fbrUsin: syncRes.usin
        };
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    alert(`Successfully synchronized ${offlineInvoices.length} queued invoices with FBR!`);
  };

  // Download Invoice HTML Receipt
  const handleDownloadInvoiceFile = (invoice) => {
    const el = document.createElement("a");
    const receiptText = `
========================================
       ${activeClient?.companyName || 'Retail Store'}
========================================
Address: ${activeClient?.address || 'Pakistan'}
NTN: ${activeClient?.ntn || '0000000'}   POS ID: ${activeClient?.posId || '000'}
----------------------------------------
Invoice #: ${invoice.invoiceNumber}
Date: ${invoice.date}
Payment: ${invoice.paymentMethod}
Customer: ${invoice.customerName}
Phone: ${invoice.customerPhone}
----------------------------------------
Items:
${invoice.items.map(item => `${item.name.padEnd(25)} Rs. ${item.price} x ${item.quantity} = Rs. ${item.subtotal}`).join('\n')}
----------------------------------------
Subtotal:                    Rs. ${invoice.subtotal}
Sales Tax (${activeClient?.salesTaxRate || 18}%):           Rs. ${invoice.salesTax}
FBR POS Fee:                 Rs. ${invoice.fbrFee}
----------------------------------------
NET BILL TOTAL:              Rs. ${invoice.total}
========================================
FBR FISCAL INTEGRATION DETAILS:
FBR Invoice #: ${invoice.fbrFiscalNumber || 'OFFLINE'}
USIN: ${invoice.fbrUsin || 'OFFLINE'}
Verification URL: https://fbr.gov.pk/verify?fbrno=${invoice.fbrFiscalNumber || ''}
========================================
    `;

    const file = new Blob([receiptText], { type: 'text/plain' });
    el.href = URL.createObjectURL(file);
    el.download = `${invoice.invoiceNumber}-FBR-fiscal-copy.txt`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  // Filtered Ledger list (safely handles missing values)
  const filteredInvoices = invoices.filter(inv => {
    if (currentUser && currentUser.role !== 'admin' && inv.clientId !== activeClient?.id) return false;
    
    const matchesSearch = (inv.invoiceNumber || '').toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                          (inv.customerName || '').toLowerCase().includes(ledgerSearch.toLowerCase());
    
    if (ledgerFilterStatus === 'ALL') return matchesSearch;
    return matchesSearch && (inv.fbrStatus === ledgerFilterStatus);
  });

  // Active client billing metrics calculations (safely handles null values)
  const clientInvoices = invoices.filter(inv => inv.clientId === activeClient?.id);
  const totalSalesVal = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalTaxCollected = clientInvoices.reduce((sum, inv) => sum + (inv.salesTax || 0), 0);
  const fbrSyncSuccessCount = clientInvoices.filter(i => i.fbrStatus === 'SUCCESS').length;
  const offlineQueueCount = clientInvoices.filter(i => i.fbrStatus === 'OFFLINE_PENDING').length;

  // If not logged in, render secure Login Panel
  if (!currentUser) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>
        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-badge">
              <div className="brand-icon" style={{ margin: '0 auto 16px auto', width: '50px', height: '50px', fontSize: '24px' }}>F</div>
              <h2 style={{ fontSize: '22px' }}>FBR Sync Gateway</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                On-Demand Integrated POS Billing Network
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Access Identity</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Enter login username"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Secure Key / Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
              </div>

              {loginError && (
                <div style={{ color: 'var(--danger)', fontSize: '12.5px', marginBottom: '16px', textAlign: 'center' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                🔒 Secure Portal Login
              </button>
            </form>

            <div className="login-hint">
              <strong>🔑 Demo Authentication Profiles:</strong>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>• System Admin: <code>admin</code> / <code>admin123</code></div>
                <div>• Al-Karam Textiles: <code>alkaram</code> / <code>alkaram123</code></div>
                <div>• Chase Up Superstore: <code>chaseup</code> / <code>chaseup123</code></div>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                type="button" 
                className="btn btn-danger btn-sm" 
                style={{ fontSize: '10px', padding: '4px 8px' }}
                onClick={handleForceClearCache}
              >
                ⚠️ Reset App Cache (If Logins Fail)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {/* 1. Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-container">
          <div className="brand-icon">F</div>
          <div>
            <h2 className="brand-title">FBR Sync</h2>
            <span style={{ fontSize: '9px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Fiscal POS Portal
            </span>
          </div>
        </div>

        <nav className="nav-menu">
          {currentUser.role === 'admin' && (
            <button 
              className={`nav-item ${activeSidebarTab === 'admin_panel' ? 'active' : ''}`}
              onClick={() => { setActiveSidebarTab('admin_panel'); setShowPrintInvoice(null); }}
            >
              ⚙️ Admin Console
            </button>
          )}

          <button 
            className={`nav-item ${activeSidebarTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveSidebarTab('dashboard'); setShowPrintInvoice(null); }}
          >
            📊 Dashboard Overview
          </button>

          <button 
            className={`nav-item ${activeSidebarTab === 'pos' ? 'active' : ''}`}
            onClick={() => { setActiveSidebarTab('pos'); setShowPrintInvoice(null); }}
          >
            🛒 POS Billing terminal
          </button>

          <button 
            className={`nav-item ${activeSidebarTab === 'inventory' ? 'active' : ''}`}
            onClick={() => { setActiveSidebarTab('inventory'); setShowPrintInvoice(null); }}
          >
            📦 Inventory Catalog
          </button>

          <button 
            className={`nav-item ${activeSidebarTab === 'customers' ? 'active' : ''}`}
            onClick={() => { setActiveSidebarTab('customers'); setShowPrintInvoice(null); }}
          >
            👥 Clients Directory
          </button>

          <button 
            className={`nav-item ${activeSidebarTab === 'fbr_hub' ? 'active' : ''}`}
            onClick={() => { setActiveSidebarTab('fbr_hub'); setShowPrintInvoice(null); }}
          >
            🔌 FBR Sync Center {offlineQueueCount > 0 && <span style={{ background: 'var(--warning)', color: '#000', padding: '1px 6px', borderRadius: '4px', fontSize: '9px', marginLeft: '6px' }}>{offlineQueueCount}</span>}
          </button>

          <button 
            className={`nav-item ${activeSidebarTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveSidebarTab('settings'); setShowPrintInvoice(null); }}
          >
            🔧 Store Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="profile-card">
            <div className="profile-avatar">
              {currentUser.role === 'admin' ? 'AD' : 'CL'}
            </div>
            <div className="profile-info">
              <div className="profile-name">{currentUser.name}</div>
              <div className="profile-role">{currentUser.role === 'admin' ? 'System Administrator' : 'Merchant Partner'}</div>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            🚪 Logout Securely
          </button>
        </div>
      </aside>

      {/* 2. Main Content Dashboard Container */}
      <main className="main-content">
        {/* Switch client selector banner - visible to Admin when emulation is active */}
        {currentUser.role === 'admin' && activeSidebarTab !== 'admin_panel' && (
          <div className="client-select-banner" style={{ marginTop: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px' }}>⚡ Impersonate POS Outlet</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Viewing mock terminal data for client store settings.
              </p>
            </div>
            <select 
              className="client-dropdown"
              value={activeClient?.id || ''}
              onChange={(e) => {
                const selected = clients.find(c => c.id === e.target.value);
                if (selected) {
                  setActiveClient(selected);
                  setCartItems([]);
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

        {/* Global Connection controller in header for client POS terminal */}
        {activeSidebarTab === 'pos' && (
          <div className="client-select-banner" style={{ marginTop: 0, background: 'rgba(255, 255, 255, 0.02)' }}>
            <div>
              <h4 style={{ margin: 0 }}>🔌 POS Connection Status</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Control PRAL/FBR endpoint state to simulate offline store-and-forward queueing.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className={`badge ${fbrConnectionMode === 'online' ? 'badge-success' : 'badge-warning'}`}>
                {fbrConnectionMode === 'online' ? 'ONLINE SYNC' : 'OFFLINE STORE'}
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setFbrConnectionMode(fbrConnectionMode === 'online' ? 'offline' : 'online')}
              >
                Toggle {fbrConnectionMode === 'online' ? 'Offline' : 'Online'} Mode
              </button>
            </div>
          </div>
        )}

        {/* --- 2.1 Tab: Dashboard Overview --- */}
        {activeSidebarTab === 'dashboard' && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Business Metrics Overview ({activeClient?.companyName || 'Store'})</h2>
            
            <div className="metrics-row">
              <div className="metric-card">
                <div className="metric-label">Total Transactions</div>
                <div className="metric-value">{clientInvoices.length}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Gross Sales Val</div>
                <div className="metric-value">Rs. {totalSalesVal.toLocaleString()}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Sales Tax Collected</div>
                <div className="metric-value">Rs. {totalTaxCollected.toLocaleString()}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">FBR Sync Status</div>
                <div className="metric-value" style={{ color: 'var(--success)' }}>
                  {fbrSyncSuccessCount} Sync / {offlineQueueCount} Pending
                </div>
              </div>
            </div>

            {/* SVG Visual Sales Tax chart */}
            <div className="card">
              <div className="card-title">Daily Sales and Tax Integration Audit Graph</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live visualization of FBR POS Gateway reporting metrics.</p>
              <svg className="svg-chart" viewBox="0 0 500 150">
                <path d="M10,130 Q100,60 200,90 T400,20 T490,40" fill="none" stroke="var(--primary)" strokeWidth="3" />
                <path d="M10,130 Q100,60 200,90 T400,20 T490,40 L490,140 L10,140 Z" fill="rgba(0, 240, 255, 0.03)" />
                <circle cx="10" cy="130" r="4" fill="var(--accent)" />
                <circle cx="100" cy="80" r="4" fill="var(--accent)" />
                <circle cx="200" cy="90" r="4" fill="var(--accent)" />
                <circle cx="400" cy="20" r="4" fill="var(--accent)" />
                <circle cx="490" cy="40" r="4" fill="var(--accent)" />
                <line x1="10" y1="140" x2="490" y2="140" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="10" y="150" fill="var(--text-muted)" fontSize="9">Mon</text>
                <text x="100" y="150" fill="var(--text-muted)" fontSize="9">Tue</text>
                <text x="200" y="150" fill="var(--text-muted)" fontSize="9">Wed</text>
                <text x="300" y="150" fill="var(--text-muted)" fontSize="9">Thu</text>
                <text x="400" y="150" fill="var(--text-muted)" fontSize="9">Fri</text>
                <text x="470" y="150" fill="var(--text-muted)" fontSize="9">Sat/Sun</text>
              </svg>
            </div>

            {/* Invoices Feed and ledger filters */}
            <div className="card">
              <div className="card-title">
                <span>Invoices Ledger & Sync Auditing</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Search by invoice # or name" 
                    className="form-control" 
                    style={{ width: '220px', padding: '6px 12px', fontSize: '12px' }}
                    value={ledgerSearch}
                    onChange={e => setLedgerSearch(e.target.value)}
                  />
                  <select 
                    className="form-control" 
                    style={{ width: '150px', padding: '6px 12px', fontSize: '12px' }}
                    value={ledgerFilterStatus}
                    onChange={e => setLedgerFilterStatus(e.target.value)}
                  >
                    <option value="ALL">All Invoices</option>
                    <option value="SUCCESS">FBR Success</option>
                    <option value="OFFLINE_PENDING">Offline Queue</option>
                    <option value="FAILED">Sync Failed</option>
                  </select>
                </div>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Customer Name</th>
                      <th>Date</th>
                      <th>GST Tax ({activeClient?.salesTaxRate || 18}%)</th>
                      <th>FBR POS Fee</th>
                      <th>Net Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map(inv => (
                      <tr key={inv.id}>
                        <td><code>{inv.invoiceNumber}</code></td>
                        <td>{inv.customerName}</td>
                        <td>{inv.date}</td>
                        <td>Rs. {inv.salesTax}</td>
                        <td>Rs. {inv.fbrFee ? inv.fbrFee.toFixed(2) : '1.00'}</td>
                        <td><strong>Rs. {inv.total}</strong></td>
                        <td>
                          <span className={`badge ${
                            inv.fbrStatus === 'SUCCESS' ? 'badge-success' : 
                            (inv.fbrStatus === 'OFFLINE_PENDING' ? 'badge-warning' : 'badge-danger')
                          }`}>
                            {inv.fbrStatus}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px' }}
                              onClick={() => setShowPrintInvoice(inv)}
                            >
                              📄 Print
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              style={{ padding: '4px 8px' }}
                              onClick={() => handleDownloadInvoiceFile(inv)}
                            >
                              ⬇️ Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 2.2 Tab: POS Billing Terminal --- */}
        {activeSidebarTab === 'pos' && !showPrintInvoice && (
          <div>
            <h2 style={{ marginBottom: '20px' }}>POS Billing Desk ({activeClient?.companyName || 'Store'})</h2>
            <div className="pos-grid">
              {/* Product Catalog */}
              <div className="card">
                <div className="card-title">Available Products Inventory</div>
                <div className="product-catalog-grid">
                  {(products[activeClient?.id || ''] || []).map(prod => (
                    <div 
                      key={prod.id} 
                      className="product-item-card" 
                      onClick={() => addToCart(prod)}
                      style={{ opacity: prod.stock === 0 ? 0.6 : 1 }}
                    >
                      <div>
                        <div className="product-item-name">{prod.name}</div>
                        <div className="product-item-hscode">HS: {prod.hsCode || 'N/A'}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="product-item-price">Rs. {prod.price}</span>
                        {prod.stock === 0 ? (
                          <span className="badge badge-danger">SOLD OUT</span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stock: {prod.stock}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkout Cart Section */}
              <div className="cart-panel">
                <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>Active Checkout Cart</h3>
                
                <div className="cart-items-list">
                  {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                      🛒 Click items on left to add to cart
                    </div>
                  ) : (
                    cartItems.map(item => (
                      <div key={item.id} className="cart-item-row">
                        <div className="cart-item-info">
                          <div className="cart-item-title">{item.name}</div>
                          <div className="cart-item-meta">Rs. {item.price} x {item.qty}</div>
                        </div>
                        <div className="cart-item-actions">
                          <button className="cart-qty-btn" type="button" onClick={() => updateCartQty(item.id, -1)}>-</button>
                          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.qty}</span>
                          <button className="cart-qty-btn" type="button" onClick={() => updateCartQty(item.id, 1)}>+</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={processCartInvoicing}>
                  {/* Select Customer */}
                  <div className="form-group">
                    <label>Select Loyalty Customer</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="form-control" 
                        value={selectedCust} 
                        onChange={e => setSelectedCust(e.target.value)}
                      >
                        <option value="">Walk-In Customer</option>
                        {(customers[activeClient?.id || ''] || []).map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                        ))}
                      </select>
                      <QuickAddCustomer clientId={activeClient?.id || ''} onAdd={cust => addCustomer(activeClient?.id || '', cust)} />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="form-group">
                    <label>Payment Method</label>
                    <div className="toggle-group">
                      <div className={`toggle-item ${paymentMethod === 'Cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('Cash')}>💵 Cash</div>
                      <div className={`toggle-item ${paymentMethod === 'Card' ? 'active' : ''}`} onClick={() => setPaymentMethod('Card')}>💳 Debit Card</div>
                    </div>
                  </div>

                  {/* Totals Summary including FBR POS Fee */}
                  {cartItems.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                        <span>Rs. {cartItems.reduce((s, i) => s + i.subtotal, 0)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>GST Tax ({activeClient?.salesTaxRate || 18}%):</span>
                        <span>Rs. {(cartItems.reduce((s, i) => s + i.subtotal, 0) * ((activeClient?.salesTaxRate || 18) / 100)).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>FBR POS Service Fee:</span>
                        <span>Rs. 1.00</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                        <span>Net Bill:</span>
                        <span style={{ color: 'var(--primary)' }}>
                          Rs. {(cartItems.reduce((s, i) => s + i.subtotal, 0) * (1 + (activeClient?.salesTaxRate || 18) / 100) + 1.00).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    disabled={cartItems.length === 0}
                  >
                    ⚡ Process Payment & Sync FBR
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Fiscal Receipt Copy Page */}
        {activeSidebarTab === 'pos' && showPrintInvoice && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPrintInvoice(null)}>
                ⬅️ Back to POS Terminal Screen
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                🖨️ Print Receipt (POS thermal)
              </button>
              <button className="btn btn-success btn-sm" onClick={() => handleDownloadInvoiceFile(showPrintInvoice)}>
                ⬇️ Download Receipt Copy
              </button>
            </div>
            
            <div className="invoice-paper">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{activeClient?.companyName || 'Retail Outlet'}</h2>
                <p style={{ color: '#475569', fontSize: '11px' }}>{activeClient?.address}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '6px', fontSize: '11px', borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
                  <span><strong>NTN:</strong> {activeClient?.ntn}</span>
                  <span><strong>POS ID:</strong> {activeClient?.posId}</span>
                </div>
              </div>

              <div className="invoice-header-grid" style={{ fontSize: '11.5px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <div>
                  <p><strong>Invoice Number:</strong> {showPrintInvoice.invoiceNumber}</p>
                  <p><strong>Date & Time:</strong> {showPrintInvoice.date}</p>
                  <p><strong>Payment Method:</strong> {showPrintInvoice.paymentMethod}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p><strong>Customer:</strong> {showPrintInvoice.customerName}</p>
                  <p><strong>Phone:</strong> {showPrintInvoice.customerPhone}</p>
                  {showPrintInvoice.customerNtn && <p><strong>Buyer NTN:</strong> {showPrintInvoice.customerNtn}</p>}
                </div>
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px', marginLeft: 'auto', marginBottom: '20px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>Rs. {showPrintInvoice.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sales Tax ({activeClient?.salesTaxRate || 18}%):</span>
                  <span>Rs. {showPrintInvoice.salesTax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>FBR POS Service Fee:</span>
                  <span>Rs. {showPrintInvoice.fbrFee ? showPrintInvoice.fbrFee.toFixed(2) : '1.00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '6px', fontWeight: 'bold', fontSize: '13.5px' }}>
                  <span>Total Amount:</span>
                  <span>Rs. {showPrintInvoice.total}</span>
                </div>
              </div>

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
                      ⚠️ OFFLINE MODE: Saved locally. Push from FBR center when online.
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
            </div>
          </div>
        )}

        {/* --- 2.3 Tab: Inventory Management --- */}
        {activeSidebarTab === 'inventory' && (
          <div className="card">
            <div className="card-title">
              <span>Catalog & Inventory Setup ({activeClient?.companyName || 'Store'})</span>
              <QuickAddProduct clientId={activeClient?.id || ''} onAdd={(prod) => addProduct(activeClient?.id || '', prod)} />
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>HS Code (8-Digit)</th>
                    <th>Price</th>
                    <th>Unit</th>
                    <th>Stock Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {(products[activeClient?.id || ''] || []).map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td><code>{p.hsCode || 'N/A'}</code></td>
                      <td>Rs. {p.price}</td>
                      <td>{p.unit}</td>
                      <td>
                        <span className={`badge ${p.stock < 10 ? 'badge-danger' : 'badge-success'}`}>
                          {p.stock} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 2.4 Tab: Customer Loyalty Directory --- */}
        {activeSidebarTab === 'customers' && (
          <div className="card">
            <div className="card-title">
              <span>Merchant Customer Loyalty Directory</span>
              <QuickAddCustomer clientId={activeClient?.id || ''} onAdd={cust => addCustomer(activeClient?.id || '', cust)} />
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Contact Phone</th>
                    <th>NTN / CNIC No.</th>
                  </tr>
                </thead>
                <tbody>
                  {(customers[activeClient?.id || ''] || []).map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.phone || 'N/A'}</td>
                      <td><code>{c.ntn || 'Walk-In'}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 2.5 Tab: FBR Integration Hub & Store-Forward Queue --- */}
        {activeSidebarTab === 'fbr_hub' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card">
              <div className="card-title">FBR POS Connectivity Terminal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                  <h4 style={{ color: 'var(--success)' }}>🟢 POS Gateway Operational</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Machine status online. All invoice submissions reported automatically in real-time.
                  </p>
                </div>

                {offlineQueueCount > 0 && (
                  <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--warning)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>⚠️ Offline Queue pending: {offlineQueueCount} invoices</span>
                      <button className="btn btn-primary btn-sm" type="button" onClick={handleBulkSyncOfflineQueue}>
                        Sync Now
                      </button>
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      Store-and-Forward protocol: These receipts were generated during connection disruptions. Click sync to post directly to PRAL database.
                    </p>
                  </div>
                )}

                <div className="form-group">
                  <label>Current FBR IMS Endpoint</label>
                  <input type="text" className="form-control" readOnly value={fbrEndpoint} />
                </div>
                <div className="form-group">
                  <label>Active License Auth Key</label>
                  <input type="text" className="form-control" readOnly value={activeClient?.authKey || ''} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">FBR Live API Log Console</div>
              <div className="logs-console">
                {fbrLogs.filter(log => log.payload?.POSID === activeClient?.posId).map((log, idx) => (
                  <div key={idx} className={`log-entry ${log.type === 'SUCCESS' ? 'success' : 'error'}`}>
                    <span className="log-time">[{log.time}]</span>
                    <strong>{log.method} {log.type}</strong>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Payload:</div>
                    <div className="json-block">{JSON.stringify(log.payload, null, 2)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Response:</div>
                    <div className="json-block">{JSON.stringify(log.response, null, 2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- 2.6 Tab: Store Settings --- */}
        {activeSidebarTab === 'settings' && (
          <div className="card">
            <div className="card-title">POS Store Setup & Receipt Messaging</div>
            <div className="form-row">
              <div className="form-group">
                <label>Company Display Name</label>
                <input type="text" className="form-control" defaultValue={activeClient?.companyName || ''} />
              </div>
              <div className="form-group">
                <label>Integrated POS ID</label>
                <input type="text" className="form-control" readOnly defaultValue={activeClient?.posId || ''} />
              </div>
            </div>
            <div className="form-group">
              <label>Outlet Physical Address</label>
              <input type="text" className="form-control" defaultValue={activeClient?.address || ''} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Receipt Header Message</label>
                <input type="text" className="form-control" defaultValue="Welcome to our outlet!" />
              </div>
              <div className="form-group">
                <label>Receipt Footer Message</label>
                <input type="text" className="form-control" defaultValue="Thank you for shopping with us." />
              </div>
            </div>
          </div>
        )}

        {/* --- 2.7 Tab: Admin Panel --- */}
        {activeSidebarTab === 'admin_panel' && currentUser.role === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="metrics-row">
              <div className="metric-card">
                <div className="metric-label">System Active Clients</div>
                <div className="metric-value">{clients.length}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Total Sync Ledgers</div>
                <div className="metric-value">{invoices.filter(i => i.fbrStatus === 'SUCCESS').length}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Collective Sales Tax</div>
                <div className="metric-value">Rs. {invoices.filter(i => i.fbrStatus === 'SUCCESS').reduce((s, i) => s + (i.salesTax || 0), 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <span>Manage Client Licenses</span>
                <QuickAddClient onAdd={addClient} />
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Store Merchant</th>
                      <th>Credentials</th>
                      <th>NTN</th>
                      <th>POS ID</th>
                      <th>City Location</th>
                      <th>Sales Tax Rate</th>
                      <th>Compliance State</th>
                      <th>Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.companyName}</strong></td>
                        <td>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            User: <code>{c.username}</code><br/>Pass: <code>{c.password}</code>
                          </span>
                        </td>
                        <td>{c.ntn}</td>
                        <td><code>{c.posId}</code></td>
                        <td>{c.city}</td>
                        <td>{c.salesTaxRate}% GST</td>
                        <td>
                          <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {c.isActive ? 'Integrated' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          {c.isActive ? (
                            <button className="btn btn-danger btn-sm" onClick={() => updateClientStatus(c.id, false)}>Disable POS</button>
                          ) : (
                            <button className="btn btn-success btn-sm" onClick={() => updateClientStatus(c.id, true)}>Enable POS</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
            <h3 style={{ marginBottom: '16px' }}>Add Loyalty Customer</h3>
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
                <input type="text" className="form-control" placeholder="e.g. 1234567-8" value={ntn} onChange={e => setNtn(e.target.value)} />
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
  const [hsCode, setHsCode] = useState('5208.3100');
  const [stock, setStock] = useState(100);

  const submit = (e) => {
    e.preventDefault();
    if (!name || !price) return;
    onAdd({ name, price: Number(price), unit, hsCode, stock });
    setName('');
    setPrice('');
    setUnit('Piece');
    setStock(100);
    setIsOpen(false);
  };

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsOpen(true)}>
        ➕ New Product
      </button>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '16px' }}>Add Product to Catalog</h3>
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
                  <label>HS Code (8-Digit)</label>
                  <input type="text" className="form-control" value={hsCode} onChange={e => setHsCode(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Initial Stock Qty</label>
                  <input type="number" className="form-control" value={stock} onChange={e => setStock(e.target.value)} />
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
        ➕ Onboard Client POS Machine
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
