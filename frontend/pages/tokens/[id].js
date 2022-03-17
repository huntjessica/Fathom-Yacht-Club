import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TokenDetail from '../../components/sections/TokenDetail';
import { useSelector } from 'react-redux';
import Web3 from 'web3';
import axios from 'axios';
import Modal from '../../components/modals/Modal';
import { Ether } from '../../components/icons';
import Button from '../../components/buttons/Button';

const { abi } = require("../../contracts/Leasing.json");
const leaseContractAddress = process.env.NEXT_PUBLIC_LEASE_CONTRACT_ADDRESS;
const tokenBatchURI = process.env.NEXT_PUBLIC_TOKEN_BATCH_URI;

export default function Token() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [metaData, setMetaData] = useState();
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [amountInvalid, setAmountInvalid] = useState(false);
    const [amount, setAmount] = useState(0);
    const [duration, setDuration] = useState(30);
    const walletAddr = useSelector((state) => state.address);
    const router = useRouter();
    const { id } = router.query;

    const getMetaData = async () => {
        try {
            setLoading(true);

            const result = await axios.get(tokenBatchURI + '/' + id);
            console.log('[result]', result);
            setLoading(false);
            setMetaData(result.data);
        }
        catch(err) {
            console.log('[err]', err);
        }
    }

    const leaseHandler = async () => {
        try {
            setAmountInvalid(false);
            if(!amount) {
                setAmountInvalid(true);
                return false;
            }
            setBtnLoading(true);
            if(typeof window === 'undefined') throw Error('window is undefined');
            const { ethereum } = window;
            if (typeof ethereum === 'undefined') throw Error('Web3 provider is not available');

            const w3 = new Web3(ethereum);
            console.log('[leaseHandler]', w3.utils.toWei(amount), duration);
            const leaseContract = new w3.eth.Contract(abi, w3.utils.toChecksumAddress(leaseContractAddress));
            const result = await leaseContract.methods.setTokenLeasable(id, w3.utils.toWei(amount), duration).send({ from: walletAddr });
            console.log('[result]', result);
            setBtnLoading(false);
        }
        catch (err) {
            console.log('[err]', err);
            setBtnLoading(false);
        }
    }

    const getLeasableTokens = async () => {
        try {
            setBtnLoading(true);
            if(typeof window === 'undefined') throw Error('window is undefined');
            const { ethereum } = window;
            if (typeof ethereum === 'undefined') throw Error('Web3 provider is not available');

            const w3 = new Web3(ethereum);
            console.log('[leaseHandler]', w3.utils.toWei(amount), duration);
            const leaseContract = new w3.eth.Contract(abi, w3.utils.toChecksumAddress(leaseContractAddress));
            const result = await leaseContract.methods.getLeasableTokens().call();
            console.log('[result]', result);
            setBtnLoading(false);
        }
        catch (err) {
            console.log('[err]', err);
            setBtnLoading(false);
        }
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    function openModal() {
        setIsModalOpen(true);
    }
    

    useEffect(() => {
        if (id) getMetaData();
    }, [id]);

    return (
        <React.Fragment>
            <Head>
                <title>{ metaData ? metaData.name : `Token #${id}` } - Fathom Yacht Club</title>
                <meta name="description" content="Generated by create next app" />
            </Head>
    
            <main className="sm:pt-20">
                {
                    loading ? (
                        <React.Fragment>
                            <div className="container flex items-center justify-center p-28">
                                <span className="block animate-spin bg-transparent border-3 border-t-primary rounded-full h-10 w-10"></span>
                            </div>
                        </React.Fragment>
                    ) : (
                        metaData && <section>
                            <TokenDetail metaData={metaData} openLeaseModal={() => setIsModalOpen(true)} />
                        </section>
                    ) 
                }
                <button onClick={getLeasableTokens}>getLeasableTokens</button>

                <Modal isOpen={isModalOpen} openModal={openModal} closeModal={closeModal} title="List item for leasing">
                    <div className="py-4">
                        <div className="mb-4">
                            <div className="py-1">
                                <label className="text-sm font-medium">Price</label>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center border border-gray-300 py-2 pl-2 pr-3 h-12 rounded-md">
                                    <Ether width="20" height="20" fill="#333" />
                                    <span className="text-sm ml-1">ETH</span>
                                </div>
                                <input
                                 type="text"
                                 className="py-2 px-2 h-12 border border-gray-300 text-md font-light rounded-md ml-2 w-full outline-none focus:ring-2"
                                 placeholder="Amount"
                                 onChange={e => setAmount(e.target.value)}
                                />
                            </div>
                            { amountInvalid && <div className="text-sm text-red-600 py-1">&times; Invalid amount</div> }
                        </div>
                        <div className="mb-4">
                            <div className="py-1">
                                <label className="text-sm font-medium">Duration</label>
                            </div>
                            <div className="flex items-center">
                                <select className="w-full text-md py-2 px-2 h-12 border border-gray-300" defaultValue="30" onChange={e => setDuration(e.target.value)}>
                                    <option value="30">30 days</option>
                                    <option value="45">45 days</option>
                                    <option value="60">60 days</option>
                                    <option value="90">90 days</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button
                             theme="secondary"
                             className={`focus:ring-4 ${btnLoading && 'cursor-not-allowed' }`}
                             onClick={leaseHandler}
                             disabled={btnLoading ? true :  false}
                            >
                                { btnLoading ? <span
                                className="block animate-spin bg-transparent border-3 border-b-white border-t-blue-400 rounded-full h-5 w-5 ..." viewBox="0 0 24 24"
                                ></span> : 
                                <span>Submit</span> }
                            </Button>
                        </div>
                    </div>
                </Modal>
            </main>
        </React.Fragment>
    );
};