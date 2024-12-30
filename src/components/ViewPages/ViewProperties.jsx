import React from 'react'
import PropertyCard from './cards/PropertyCard'

function ViewProperties({data}) {
  return (
    <div className='flex'>
        {data.length >0 && data.map((property,index) =>{
            return <PropertyCard key={index} props={property}/>
        })}
    </div>
  )
}

export default ViewProperties