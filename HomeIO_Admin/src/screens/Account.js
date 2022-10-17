const Account = () => {
    return (
        <div className="mt-16 mb-5">
            <div className="text-center"><span className="font-bold text-2xl md:text-4xl text-white">Επεξεργασία Στοιχείων</span></div>
            <form className="mx-20 mt-12">
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-20">
                    <div>
                        <h3 className="text-white mb-4 text-lg">Email</h3>
                        <input type="text" className="rounded bg-gray-200 p-2" placeholder="email address" />
                    </div>
                    <div>
                        <h3 className="text-white mb-4 text-lg">Κωδικός</h3>
                        <input type="password" className="rounded bg-gray-200 p-2" placeholder="password" />
                    </div>
                    <div>
                        <h3 className="text-white mb-4 text-lg">Επιβεβαίωση κωδικού</h3>
                        <input type="password" className="rounded bg-gray-200 p-2" placeholder="repeat password" />
                    </div>
                </div>
                <div className="mt-16 text-center">
                    <button className="rounded bg-custom-blue px-4 py-2 font-bold">Ενημέρωση</button>
                </div>
            </form>
        </div>
    );
}

export default Account;