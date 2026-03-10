import { BarChart2, ShoppingBag, Users, Zap, Leaf } from "lucide-react";
import { motion } from "framer-motion";removeEventListener

import Header from "../common/Header";
import ControlPanel from "./Cnesp";


const OverviewPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Restplast'/>

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					<ControlPanel></ControlPanel>
				</div>
			</main>
		</div>
	);
};
export default OverviewPage;
