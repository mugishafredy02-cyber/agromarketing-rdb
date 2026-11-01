// ====================================================================
// AGROMARKET RWANDA - SERVER.JS (Node.js & Express API)
// Babo Enterprise Backend Server
// ====================================================================

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Ku bw'amakuru yo mu bwoko bwa JSON
app.use(express.urlencoded({ extended: true }));

// Dynamic Database yo kugeza ubu (Mock Database Array)
// Shira ikaze: Muri Production uzahuza iyi koresheje MongoDB cyangwa PostgreSQL
let farmers = [];
let produceList = [
    { id: 1, name: "Ibigori Bizima", farmer: "Musanze Coop", district: "Musanze", price: 350, qtyKg: 5000 },
    { id: 2, name: "Ibirayi bya Musanze", farmer: "Jean Farm Ltd", district: "Musanze", price: 400, qtyKg: 12000 },
    { id: 3, name: "Inyanya Zize", farmer: "Babo Farm", district: "Bugesera", price: 600, qtyKg: 500 }
];
let orders = [];

// ====================================================================
// INKINGI YA 1: KWIYANDIKISHA N'UKWINJIRA KW'UMUHINZI (AUTH & RDB)
// ====================================================================

// 📝 1. Kwiyandikisha kw'Umuhinzi (Farmer Registration)
app.post('/api/farmers/register', (req, res) => {
    const { farmName, district, sector, phone, email, rdbCertificate } = req.body;

    if (!farmName || !district || !sector || !phone) {
        return res.status(400).json({ success: false, message: "Uzuzamo amakuru yose akenewe!" });
    }

    const newFarmer = {
        id: farmers.length + 1,
        farmName,
        district,
        sector,
        phone,
        email: email || null,
        rdbCertificate: rdbCertificate || "Ntabwo ifite",
        createdAt: new Date()
    };

    farmers.push(newFarmer);
    console.log("Umuhinzi mushya yiyandikishije:", newFarmer);

    return res.status(201).json({
        success: true,
        message: "Kwiyandikisha k'Umuhinzi byagenze neza!",
        farmer: newFarmer
    });
});

// 🔐 2. Umuhinzi Kwinjira (Farmer Login)
app.post('/api/farmers/login', (req, res) => {
    const { phoneOrEmail, password } = req.body;

    // Demo Verification (Muri application nyakuri uzagenzura password hash)
    if (!phoneOrEmail || !password) {
        return res.status(400).json({ success: false, message: "Shyiramo Telefoni/Email n'Umubare w'Ibanga!" });
    }

    return res.status(200).json({
        success: true,
        message: "Mwinjiye neza muri AgroMarket!",
        token: "jwt-token-demo-12345", // Demo authentication token
        user: { phoneOrEmail }
    });
});

// ====================================================================
// INKINGI YA 2: ISOKO N'UMUSARURO (MARKETPLACE API)
// ====================================================================

// 🛒 1. Kubona Ibicuruzwa Biri mu Isoko (Get Active Produce Listings)
app.get('/api/produce', (req, res) => {
    res.status(200).json({
        success: true,
        count: produceList.length,
        data: produceList
    });
});

// ➕ 2. Gushyiraho Umusaruro Mushya (Add New Produce)
app.post('/api/produce', (req, res) => {
    const { name, farmer, district, price, qtyKg } = req.body;

    const newCrop = {
        id: produceList.length + 1,
        name,
        farmer,
        district,
        price: Number(price),
        qtyKg: Number(qtyKg)
    };

    produceList.push(newCrop);
    res.status(201).json({ success: true, message: "Umusaruro wajijwe ku isoko!", crop: newCrop });
});

// ====================================================================
// INKINGI YA 3: DASHBOARD Y'UMUHINZI (FARMER STATS & DASHBOARD)
// ====================================================================

// 📊 1. Incamake y'Amakuru ya Dashboard
app.get('/api/dashboard/stats', (req, res) => {
    const totalQty = produceList.reduce((acc, curr) => acc + curr.qtyKg, 0);
    
    res.status(200).json({
        success: true,
        stats: {
            totalProduceKg: totalQty,
            pendingOrders: orders.length,
            totalRevenueFrw: 4500000 // Demo revenue figure
        }
    });
});

// ====================================================================
// INKINGI YA 4: UBURYO BWO KWISHYURA (PAYMENT GATEWAY - MoMo & CARDS)
// ====================================================================

// 💸 1. Kwishyura Umusaruro (Initiate Payment)
app.post('/api/payments/checkout', (req, res) => {
    const { cropName, qtyKg, totalAmount, payMethod, phone, cardNumber } = req.body;

    if (!totalAmount || !payMethod) {
        return res.status(400).json({ success: false, message: "Hitamo uburyo bwo kwishyura n'ingano y'amafaranga!" });
    }

    const newOrder = {
        id: orders.length + 1,
        cropName,
        qtyKg,
        totalAmount,
        payMethod,
        account: payMethod === 'Bank Card' ? cardNumber : phone,
        status: "SUCCESSFUL",
        timestamp: new Date()
    };

    orders.push(newOrder);
    console.log("Payment Transaction Success:", newOrder);

    // Hano niho hazajya habaho gukora API call kuri MTN MoMo / Airtel Money / Bank Gateways
    return res.status(200).json({
        success: true,
        message: `Ukwishyura kwa ${totalAmount} FRW binyuze kuri ${payMethod} kwatangiye neza! Reba kuri telefoni wemeze.`,
        order: newOrder
    });
});

// Sever Root Route
app.get('/', (req, res) => {
    res.send("🌾 AgroMarket Rwanda API Backend Server runs smoothly!");
});

// Gufungura Server
app.listen(PORT, () => {
    console.log(`🚀 Server irakora ku poroti: http://localhost:${PORT}`);
});