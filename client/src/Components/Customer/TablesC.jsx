import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { classNames } from 'primereact/utils';
import { useGetFurnitureByCategoryQuery } from '../../Store/furnitureApiSlice'
import { useAddFurnitureForBasketMutation, useGetBasketsUserQuery } from '../../Store/basketApiSlice';
import useAuth from '../Hooks/useAuth';
import { InputText } from 'primereact/inputtext';
import { useNavigate } from 'react-router-dom'
import { Sidebar } from 'primereact/sidebar';
import '../../CSS/Furniture.css'
 

const TablesC = () => {

    const [tables, setTables] = useState([]);
    const [allTables, setAllTables] = useState([]);
    const [layout, setLayout] = useState('grid');
    const [from, setFrom] = useState();
    const [to, setTo] = useState();
    const [search, setSearch] = useState();
    const [products, setProducts] = useState([]);
    const [visible, setVisible] = useState(false);
    const [localStorageProducts, setLocalStorageProducts] = useState([]);
    const { _id } = useAuth()
    const { data: dataBasket } = useGetBasketsUserQuery(_id);
    const [addFurnitureForBasketFunc] = useAddFurnitureForBasketMutation()
    const Navigate = useNavigate()
    const { data, isLoading, isError, error } = useGetFurnitureByCategoryQuery("table")


    useEffect(() => {
        if (!_id) {
            const dataLocalStorage = localStorage.getItem('basket');
            setLocalStorageProducts(dataLocalStorage ? JSON.parse(dataLocalStorage) : []);
        }
    }, [_id]);

    useEffect(() => {
        if (dataBasket) {
            setProducts(dataBasket.items);
        }
    }, [dataBasket]);


    useEffect(() => {
        filter()
    }, [from, to, search])


    const filter = () => {
        let filterTables;

        if (search) {
            if (from) {
                if (to) {
                    filterTables = allTables.filter(t => t.price >= from && t.price <= to && t.description.includes(search))
                }
                else {
                    filterTables = allTables.filter(t => t.price >= from && t.description.includes(search))
                }
            }
            else {
                if (to) {
                    filterTables = allTables.filter(t => t.price <= to && t.description.includes(search))
                }
                else {

                    filterTables = allTables.filter(t => t.description.includes(search))
                }
            }
        }
        else {
            if (from) {
                if (to) {
                    filterTables = allTables.filter(t => t.price >= from && t.price <= to)
                }
                else {
                    filterTables = allTables.filter(t => t.price >= from)
                }
            }
            else {
                if (to) {
                    filterTables = allTables.filter(t => t.price <= to)
                }
                else {

                    filterTables = allTables
                }
            }
        }
        setTables(filterTables)
    }


    const HandleToBasket = (table) => {
        if (sessionStorage.getItem('token')) {
            addFurnitureForBasketFunc({ user: _id, furniture: table, quantity: 1 })
        }
        else {

            const basket = JSON.parse(localStorage.getItem('basket')) || []
            const exsistFurniture = basket.find(f => f.furniture._id === table._id)
            if (exsistFurniture) {
                exsistFurniture.quantity += 1
            }
            else {
                const furnitureForBasket = {
                    furniture: table,
                    quantity: 1
                }
                basket.push(furnitureForBasket)
            }

            localStorage.setItem('basket', JSON.stringify(basket))
            setLocalStorageProducts(basket);
        }
        setVisible(true)
    }

    useEffect(() => {
        if (data) {
            setAllTables(data);
            setTables(data);
        }
    }, [data]);

    if (isLoading) {
        return <h1>Loading</h1>
    }
    if (isError) {
        return <h2>{error}</h2>
    }



    const listItem = (table, index) => {
        return (
            <div className="col-12" key={table.id}>
                <div className={classNames('flex flex-column xl:flex-row xl:align-items-start p-4 gap-4', { 'border-top-1 surface-border': index !== 0 })}>
                    <img className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round" src={`http://localhost:8050/uploads/${table?.image?.split("\\")[2]}`} />
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div className="text-2xl font-bold text-900">{table.description}</div>
                        </div>
                        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                            <span className="text-2xl font-semibold">{table.price} ₪</span>
                            <Button icon="pi pi-shopping-cart" className="p-button-rounded" onClick={() => HandleToBasket(table)}></Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const gridItem = (table) => {
        return (
            <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={table.id}>
                <div className="p-4 border-1 surface-border surface-card border-round">
                    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                    </div>
                    <div className="flex flex-column align-items-center gap-3 py-5">
                        <img className="w-9 shadow-2 border-round" src={`http://localhost:8050/uploads/${table?.image?.split("\\")[2]}`} alt={table.name} />
                        <div className="gridDescription">{table.description}</div>
                    </div>
                    <div className="flex align-items-center justify-content-between">
                        <span className="text-2xl font-semibold">{table.price} ₪</span>
                        <Button icon="pi pi-shopping-cart" className="p-button-rounded" onClick={() => HandleToBasket(table)}></Button>
                    </div>
                </div>
            </div>
        );
    };

    const itemTemplate = (table, layout, index) => {
        if (!table) {
            return;
        }

        if (layout === 'list') return listItem(table, index);
        else if (layout === 'grid') return gridItem(table);
    };

    const listTemplate = (tables, layout) => {
        return <div className="grid grid-nogutter">{tables.map((table, index) => itemTemplate(table, layout, index))}</div>;
    };

    const header = () => {
        return (
            <div className="headerCustomer">
                <div>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText className='inputSearch' type="search" placeholder="...חיפוש" onChange={(e) => {
                            setSearch(e.target.value)
                        }} />
                    </span>
                    <InputText className='inputPrice' keyfilter="int" placeholder="עד מחיר" onChange={(e) => {
                        setTo(e.target.value)
                    }} />
                    <InputText className='inputPrice' keyfilter="int" placeholder="-ממחיר" onChange={(e) => {
                        setFrom(e.target.value);
                    }} />
                </div>
                <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
            </div>
        );
    };

    return (
        <div>
            <div>
                <Sidebar visible={visible} position="right" onHide={() => setVisible(false)}>
                    <h2>הסל שלך</h2><br />

                    {(_id ? products : localStorageProducts).map(element => {
                        return (
                            <>
                                <div style={{ borderBottom: '1px solid black' }}>
                                    <div style={{ textAlign: 'center', fontSize: '20px' }}>{element.furniture.description}</div>
                                    <img src={`http://localhost:8050/uploads/${element.furniture?.image?.split("\\")[2]}`} />
                                    <div style={{ fontSize: '18px', fontWeight: '600' }}>כמות: {element.quantity}</div>
                                    <br />
                                </div>
                            </>
                        )
                    })}
                    <br />
                    <div style={{ textAlign: 'center' }}>
                        <Button label="למעבר לסל" onClick={() => {
                            Navigate("/basket")
                        }} /></div>
                </Sidebar>
            </div>
            <DataView value={tables} listTemplate={listTemplate} layout={layout} header={header()} />
        </div>

    )
}

export default TablesC