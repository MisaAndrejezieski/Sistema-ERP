// DASHBOARD ROTAS
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const totalVendas = await sequelize.query('SELECT COALESCE(SUM(valor_total), 0) as total FROM vendas');
        const totalClientes = await sequelize.query('SELECT COUNT(*) as total FROM clientes');
        const totalUsuarios = await sequelize.query('SELECT COUNT(*) as total FROM usuarios');
        const totalProdutos = await sequelize.query('SELECT COUNT(*) as total FROM produtos');
        
        res.json({
            totalVendas: totalVendas[0][0].total,
            totalClientes: totalClientes[0][0].total,
            totalUsuarios: totalUsuarios[0][0].total,
            totalProdutos: totalProdutos[0][0].total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/dashboard/vendas-por-mes', async (req, res) => {
    try {
        const result = await sequelize.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon/YY') as mes,
                COALESCE(SUM(valor_total), 0) as total
            FROM vendas 
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(created_at, 'Mon/YY')
            ORDER BY MIN(created_at)
        `);
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/dashboard/vendas-por-vendedor', async (req, res) => {
    try {
        const result = await sequelize.query(`
            SELECT u.nome, COALESCE(SUM(v.valor_total), 0) as total
            FROM usuarios u
            LEFT JOIN vendas v ON u.id = v.vendedor_id
            WHERE u.cargo = 'vendedor'
            GROUP BY u.id, u.nome
            ORDER BY total DESC
        `);
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/dashboard/ultimas-vendas', async (req, res) => {
    try {
        const result = await sequelize.query(`
            SELECT v.id, c.nome as cliente, u.nome as vendedor, v.valor_total as valor, v.status, v.created_at as data
            FROM vendas v
            JOIN clientes c ON v.cliente_id = c.id
            JOIN usuarios u ON v.vendedor_id = u.id
            ORDER BY v.created_at DESC
            LIMIT 10
        `);
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});