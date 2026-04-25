import LigneBus from './LigneBus';
import './ListeLignes.css';


function ListeLignes({lignes}) {
	return (
		<div className="liste-lignes">
			<h2 className="liste-titre">Ligne Dakar Dem Dikk</h2>
			<p className="liste-description">
				{lignes.length} lignes disponibles
			</p>
			{lignes.map(lignes => (
				<LigneBus
					key={lignes.numero}
					numero={lignes.id}
					depart={lignes.depart}
					arrivee={lignes.arrivee}
					arrets={lignes.arrets}
				/>
			))}
		</div>
	);
}

export default ListeLignes;