import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { classNames } from 'primereact/utils';
import { useGetFurnitureByCategoryQuery } from '../../Store/furnitureApiSlice'
import { useAddFurnitureForBasketMutation } from '../../Store/basketApiSlice';
import useAuth from '../Hooks/useAuth';
import { InputText } from 'primereact/inputtext';


const SofasC = () => {

    const [sofas, setSofas] = useState([]);
    const [allSofas, setAllSofas] = useState([]);
    const [layout, setLayout] = useState('grid');
    const [from, setFrom] = useState();
    const [to, setTo] = useState();
    const [search, setSearch] = useState();

    const { data, isLoading, isError, error } = useGetFurnitureByCategoryQuery("sofa")

    useEffect(() => {
        filter()
    }, [from, to, search])


    const filter = () => {
        let filterSofas;

        if (search) {
            if (from) {
                if (to) {
                    filterSofas = allSofas.filter(s => s.price >= from && s.price <= to && s.description.includes(search))
                }
                else {
                    filterSofas = allSofas.filter(s => s.price >= from && s.description.includes(search))
                }
            }
            else {
                if (to) {
                    filterSofas = allSofas.filter(s => s.price <= to && s.description.includes(search))
                }
                else {

                    filterSofas = allSofas.filter(s => s.description.includes(search))
                }
            }
        }
        else {
            if (from) {
                if (to) {
                    filterSofas = allSofas.filter(s => s.price >= from && s.price <= to)
                }
                else {
                    filterSofas = allSofas.filter(s => s.price >= from)
                }
            }
            else {
                if (to) {
                    filterSofas = allSofas.filter(s => s.price <= to)
                }
                else {

                    filterSofas = allSofas
                }
            }
        }
        setSofas(filterSofas)
    }

    

    const [addFunc] = useAddFurnitureForBasketMutation()
    const { _id } = useAuth()

    const HandleToBasket = (sofa) => {
        if (sessionStorage.getItem('token')) {//בשעשה לןגין
            addFunc({ user: _id, furniture: sofa })
        }
        else {

            const basket = JSON.parse(localStorage.getItem('basket')) || []
            const exsistFurniture = basket.find(f => f.furniture._id === sofa._id)
            if (exsistFurniture) {
                exsistFurniture.quantity += 1
            }
            else {
                const furnitureForBasket = {
                    furniture: sofa,
                    quantity: 1
                }
                basket.push(furnitureForBasket)
            }

            localStorage.setItem('basket', JSON.stringify(basket))
        }
    }

    useEffect(() => {
        if (data) {
            setSofas(data);
            setAllSofas(data);
        }
    }, [data]);

    if (isLoading) {
        return <h1>Loading</h1>
    }
    if (isError) {
        return <h2>{error}</h2>
    }



    const listItem = (sofa, index) => {
        return (
            <div className="col-12" key={sofa.id}>
                <div className={classNames('flex flex-column xl:flex-row xl:align-items-start p-4 gap-4', { 'border-top-1 surface-border': index !== 0 })}>
                    <img className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round" src={`http://localhost:8050/uploads/${sofa?.image?.split("\\")[2]}`} />
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div className="text-2xl font-bold text-900">{sofa.description}</div>
                        </div>
                        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                            <span className="text-2xl font-semibold">{sofa.price} ₪</span>
                            <Button icon="pi pi-shopping-cart" className="p-button-rounded" onClick={() => HandleToBasket(sofa)}></Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const gridItem = (sofa) => {
        return (
            <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={sofa.id}>
                <div className="p-4 border-1 surface-border surface-card border-round">
                    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                        {/* <div className="flex align-items-center gap-2">
                            <i className="pi pi-tag"></i>
                            <span className="font-semibold">{sofa.category}</span>
                        </div> */}
                    </div>
                    <div className="flex flex-column align-items-center gap-3 py-5">
                        <img className="w-9 shadow-2 border-round" src={`http://localhost:8050/uploads/${sofa?.image?.split("\\")[2]}`} />
                        <div className="text-2xl font-bold">{sofa.description}</div>
                    </div>
                    <div className="flex align-items-center justify-content-between">
                        <span className="text-2xl font-semibold">{sofa.price} ₪</span>
                        <Button icon="pi pi-shopping-cart" className="p-button-rounded" onClick={() => HandleToBasket(sofa)}></Button>
                    </div>
                </div>
            </div>
        );
    };

    const itemTemplate = (sofa, layout, index) => {
        if (!sofa) {
            return;
        }

        if (layout === 'list') return listItem(sofa, index);
        else if (layout === 'grid') return gridItem(sofa);
    };

    const listTemplate = (sofas, layout) => {
        return <div className="grid grid-nogutter">{sofas.map((sofa, index) => itemTemplate(sofa, layout, index))}</div>;
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
        <div className="card">
            <DataView value={sofas} listTemplate={listTemplate} layout={layout} header={header()} />
        </div>
    )
}

export default SofasC