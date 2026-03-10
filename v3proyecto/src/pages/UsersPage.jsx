
import Header from "../common/Header";
import UsersTableWithFirebase from "../users/UsersTable";

const UsersPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Users' />
			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				
				<UsersTableWithFirebase />

			</main>
		</div>
	);
};
export default UsersPage;
